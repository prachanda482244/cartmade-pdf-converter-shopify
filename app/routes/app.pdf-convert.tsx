import {
  DropZone,
  LegacyStack,
  Text,
  Page,
  Button,
  Icon,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import {
  json,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import path from "path";
import { extractImagesFromPDF, sleep, uploadImage } from "app/utils/utils";
import { apiVersion, authenticate } from "app/shopify.server";
import axios from "axios";
import fs from "fs";
import { PDFVALUES } from "app/constants/types";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  if (request.method === "post" || request.method === "POST") {
    const uploadHandler = unstable_createFileUploadHandler({
      directory: path.join(process.cwd(), "public", "uploads"),
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename,
    });

    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler,
    );

    const pdf = formData.get("pdf") as File;
    const pdfName = formData.get("pdfName") || pdf?.name || "Untitled PDF";
    if (!pdf) return json({ error: "No file uploaded" }, { status: 400 });

    const pdfPath = path.join(process.cwd(), "public", "uploads", pdf.name);
    const imageUrls = await extractImagesFromPDF(pdfPath);
    const readedUrls = [];

    for (let url of imageUrls) {
      const imagePath = path.join(process.cwd(), "public", url);
      const imageBuffer = fs.readFileSync(imagePath);
      readedUrls.push(imageBuffer);
    }

    const uploadedImages = [];

    for (const imageBuffer of readedUrls) {
      const resourceUrl = await uploadImage(
        imageBuffer,
        shop,
        accessToken,
        apiVersion,
      );
      uploadedImages.push(resourceUrl);
    }

    const createFileQuery = `mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        alt
         fileStatus
        id
        preview{
        image{
            url
            id
            height
            width
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

    const createFileVariables = {
      files: uploadedImages.map((url) => ({
        alt: "alt-tag",
        contentType: "IMAGE",
        originalSource: url,
      })),
    };

    const createFileQueryResult = await axios.post(
      `https://${shop}/admin/api/${apiVersion}/graphql.json`,
      {
        query: createFileQuery,
        variables: createFileVariables,
      },
      {
        headers: {
          "X-Shopify-Access-Token": `${accessToken}`,
        },
      },
    );

    const fileIds = createFileQueryResult.data.data.fileCreate.files.map(
      (file: any) => file.id,
    );

    const GET_FILE_QUERY = `
    query GetFilePreviews($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on File {
          fileStatus
          preview {
          image {
            url
          }
        }
      }
    }
  }
  `;

    await sleep(5000);
    const response = await admin.graphql(GET_FILE_QUERY, {
      variables: {
        ids: fileIds,
      },
    });

    const { data } = await response.json();
    const metaFieldImage = data.nodes.map(
      ({ preview }: any) => preview.image.url,
    );
    console.log(metaFieldImage, "Images");
    // Delete temporary uploaded images
    imageUrls.forEach((url) => {
      const imagePath = path.join(process.cwd(), "public", url);
      fs.unlink(imagePath, (err) => {
        if (err) console.error(`Error deleting file ${imagePath}:`, err);
      });
    });

    const metafieldData = {
      namespace: "PDF",
      key: "fields" + Date.now(),
      value: JSON.stringify({
        pdfName: pdfName,

        images: metaFieldImage.map((img: string, index: number) => ({
          id: index + 1,
          url: img,
          points: [],
        })),
      }),
      type: "json",
      owner_resource: "shop",
    };

    const { data: imageData } = await axios.post(
      `https://${shop}/admin/api/${apiVersion}/metafields.json`,
      { metafield: metafieldData },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      },
    );

    if (!data) {
      return json({ error: "Failed to save metafield" }, { status: 400 });
    }

    return json({
      images: uploadedImages,
      pdfName,
      metafiledData: imageData,
    });
  } else if (request.method === "DELETE" || request.method === "delete") {
    const formData = await request.formData();
    const metafieldId: any = formData.get("metafieldId");
    console.log(metafieldId);
    if (!metafieldId) {
      return json({ error: "No metafieldId provided" }, { status: 400 });
    }

    return json({ message: "Metafield deleted successfully" });
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const GET_PDF_QUERY = `
    query GetPDFQuery {
      shop {
        metafields(first: 15, namespace: "PDF") {
          edges {
            node {
              id
              namespace
              key
              jsonValue
              type
            }
          }
        }
      }
    }
  `;

  try {
    const data = await admin.graphql(GET_PDF_QUERY);

    if (!data) {
      console.error("Failed to fetch PDF metafield");
      return { error: "Failed to fetch PDF metafield." };
    }
    const response = await data.json();
    const pdfMetafields = response.data.shop.metafields.edges.map(
      (edge: any) => edge.node,
    );
    if (!pdfMetafields.length) {
      console.warn("No PDF metafields found.");
      return { error: "No PDF metafields found." };
    }
    const actualResponse = pdfMetafields.map((pdf: any) => ({
      id: pdf.id.split("/")[pdf.id.split("/").length - 1],
      pdfName: pdf.jsonValue.pdfName,
      frontPage: pdf.jsonValue.images[0]?.url,
      allImages: pdf.jsonValue.images,
    }));

    return { pdfData: actualResponse };
  } catch (error) {
    console.error("Error fetching PDF metafields:", error);
    return { error: "Unexpected error occurred while fetching metafields." };
  }
};

const PDFConverter = () => {
  const { pdfData } = useLoaderData<PDFVALUES>();
  console.log(pdfData);
  const fetcher = useFetcher();

  const [files, setFiles] = useState<File[]>([]);
  console.log(files, "files");
  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setFiles((files) => [...files, ...acceptedFiles]);

      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("pdf", file));

      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
    },
    [],
  );

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Accepts PDF only" />
  );

  const uploadedFiles = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <div className="p-4 text-center flex items-center justify-center">
          <LegacyStack alignment="center" key={index}>
            {file.name}{" "}
            <Text variant="bodySm" alignment="center" as="p">
              {file.size} bytes
            </Text>
          </LegacyStack>
        </div>
      ))}
    </LegacyStack>
  );
  const handlePdfDelete = (id: string, target: any) => {
    const confirmation = confirm("Are you sure you want to delete ? ");
    const metaFieldId = `gid://shopify/Metafield/${id}`;
    const formData = new FormData();
    formData.append("metafieldId", metaFieldId);
    if (confirmation) {
      fetcher.submit(formData, { method: "delete" });
    }
  };

  const navigate = useNavigate();

  return (
    <>
      <Page backAction={{ content: "Settings", url: "#" }} title="PDF">
        <Form method="post">
          <div className="flex w-full items-center mt-2 justify-center ">
            <div className="w-1/2 flex flex-col gap-3">
              <DropZone
                onDrop={handleDropZoneDrop}
                accept="application/pdf"
                allowMultiple={false}
                variableHeight
              >
                {uploadedFiles}
                {fileUpload}
              </DropZone>
            </div>
          </div>
        </Form>

        {/* Main section  */}
        <Form>
          <div className="grid gap-3 mt-5 items-start md:grid-cols-4 sm:grid-col-2 grid-cols-1">
            {pdfData.map(({ pdfName, frontPage, id }) => (
              <div className="border bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-36 overflow-hidden relative">
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    src={frontPage}
                  />
                  <button
                    type="submit"
                    className="absolute  right-2 top-1"
                    onClick={(e) => handlePdfDelete(id, e.currentTarget)}
                  >
                    <Icon source={DeleteIcon} tone="textCritical" />
                  </button>
                </div>
                <div className="px-3 py-4 flex items-center justify-between">
                  <span>{pdfName.slice(0, 10) + ".pdf"}</span>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/app/details/${id}`)}
                    size="micro"
                  >
                    view details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Form>
      </Page>
    </>
    // <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 space-y-8 p-4">
    //   {jsonValue && (
    //     <div>
    //       <h2 className="text-4xl font-bold mb-8 text-gray-800">
    //         PDF to Image Converter
    //       </h2>
    //       <Form
    //         method="post"
    //         encType="multipart/form-data"
    //         className="mb-8 w-full max-w-md space-y-4"
    //       >
    //         <input
    //           type="text"
    //           name="pdfName"
    //           placeholder="Enter a name for your PDF"
    //           className="w-full px-4 py-2 text-lg bg-blue-50 border border-blue-300 rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
    //         />
    //         <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-500 rounded-lg py-4">
    //           <label htmlFor="file-upload" className="cursor-pointer">
    //             <div className="flex flex-col items-center">
    //               <svg
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 className="w-12 h-12 text-blue-500 mb-2"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //                 stroke="currentColor"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth={2}
    //                   d="M12 4v16m8-8H4"
    //                 />
    //               </svg>
    //               <span className="text-blue-500 font-medium">
    //                 {selectedFileName || "Click to upload PDF"}
    //               </span>
    //             </div>
    //           </label>
    //           <input
    //             id="file-upload"
    //             type="file"
    //             name="pdf"
    //             accept="application/pdf"
    //             onChange={handleFileChange}
    //             required
    //             className="hidden"
    //           />
    //         </div>

    //         <button
    //           type="submit"
    //           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-lg transition"
    //         >
    //           Submit
    //         </button>
    //       </Form>
    //     </div>
    //   )}

    //   {jsonValue?.pdfName && (
    //     <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden p-4 space-y-4">
    //       <h3 className="text-xl font-semibold text-gray-700">
    //         Uploaded PDF Name: {jsonValue.pdfName}
    //       </h3>
    //     </div>
    //   )}

    //   {jsonValue?.images && (
    //     <PageFlip images={jsonValue.images} metaFieldId={id} />
    //   )}
    // </div>
  );
};

export default PDFConverter;

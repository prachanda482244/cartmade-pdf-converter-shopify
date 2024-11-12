import {
  DropZone,
  LegacyStack,
  Text,
  Page,
  Button,
  Icon,
  Spinner,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect } from "react";
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
  console.log(request.method, "METHOD");
  if (request.method === "POST" || request.method === "post") {
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
    // Delete temporary uploaded images

    imageUrls.forEach((url) => {
      const imagePath = path.join(process.cwd(), "public", url);
      console.log(imagePath, "PATH");
      fs.unlink(imagePath, (err) => {
        if (err) console.error(`Error deleting file ${imagePath}:`, err);
      });
    });

    fs.unlink(pdfPath, (err) => {
      if (err) console.error(`Error deleting file ${pdfPath}:`, err);
    });

    return json({
      success: true,
      message: "PDF uploaded successfully",
      imageData,
    });
  } else if (request.method === "DELETE" || request.method === "delete") {
    const formData = await request.formData();
    const metafieldId: any = formData.get("metafieldId");
    if (!metafieldId) {
      return json({ error: "No metafieldId provided" }, { status: 400 });
    }
    try {
      const DELETE_META_FIELD = `
      mutation DeleteMetafield($id: ID!) {
        metafieldDelete(input: { id: $id }) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `;

      const response = await admin.graphql(DELETE_META_FIELD, {
        variables: {
          id: metafieldId,
        },
      });
      const { data } = await response.json();
      if (!data) {
        return json({ error: "Failed to delete metafield" }, { status: 400 });
      }
      return { message: "Metafield deleted successfully" };
    } catch (error: any) {
      console.error(error, "Errors");
      console.error(error?.body.errors, "Errorsssssssssssss");

      return { message: "something went wrong" };
    }
  }
  return json({ error: "Unknown method" }, { status: 400 });
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
    // console.log(pdfMetafields, "FUCKING METAFIELDD");

    const actualResponse = pdfMetafields.map((pdf: any) => ({
      id: pdf.id.split("/")[pdf.id.split("/").length - 1],
      pdfName:
        pdf.jsonValue.pdfName !== null
          ? pdf.jsonValue?.pdfName
          : "Untitled Document",
      frontPage:
        pdf.jsonValue.images !== null ? pdf.jsonValue?.images[0]?.url : "",
      allImages: pdf.jsonValue.images !== null ? pdf.jsonValue?.images : [],
      key: pdf.key,
      namespace: pdf.namespace,
    }));

    // console.log(actualResponse, "ACtual response");
    return { pdfData: actualResponse };
  } catch (error) {
    console.error("Error fetching PDF metafields:", error);
    return { error: "Unexpected error occurred while fetching metafields." };
  }
};

const PDFConverter = () => {
  const loader = useLoaderData();
  console.log(loader, "LOADER");
  const { pdfData } = useLoaderData<PDFVALUES>();
  console.log(pdfData, "PDF DATA");
  const fetcher = useFetcher();
  const [deleteId, setDeleteId] = useState<any>();
  const [fileUploadTracker, setFileUploadTracker] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // const [openPdf, setOpenPdf] = useState<boolean>(false);
  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setFiles((files) => [...files, ...acceptedFiles]);

      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("pdf", file));

      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
      // simulateProgress();

      setFileUploadTracker(true);
    },
    [],
  );

  // const simulateProgress = () => {
  //   let progress = 0;
  //   const interval = setInterval(() => {
  //     progress += 5;
  //     setUploadProgress(progress);
  //     if (progress >= 100) {
  //       clearInterval(interval);
  //     }
  //   }, 700);
  // };

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Accepts PDF only" />
  );

  const uploadedFiles = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <div className="p-4 text-center flex items-center justify-center">
          <LegacyStack alignment="center" key={index}>
            <Text variant="bodySm" alignment="center" as="p">
              uploading {file.name}
              {/* {uploadProgress}% */}
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
      setFileUploadTracker(false);
      setDeleteId(id);
    }
    setFiles([]);
  };
  const navigate = useNavigate();

  return (
    <Page
      backAction={{ content: "Settings", url: "/app" }}
      // primaryAction={{
      //   content: !openPdf ? "Add new pdf" : "Close pdf",
      //   onAction: () => {
      //     filei;
      //   },
      // }}
      title="PDFs"
    >
      <Form method="post">
        <div className="flex w-full items-center mt-2 justify-center ">
          <div className="w-full flex flex-col gap-3">
            <DropZone
              onDrop={handleDropZoneDrop}
              accept="application/pdf"
              allowMultiple={false}
              variableHeight
              type="file"
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
          {pdfData?.map(({ pdfName, frontPage, id }) => (
            <div
              className="border bg-white rounded-lg cursor-pointer shadow-md overflow-hidden"
              onClick={() => navigate(`/app/details/${id}`)}
            >
              <div className="h-36  overflow-hidden relative">
                {id === deleteId ? (
                  <div className="absolute h-full w-full bg-white flex items-center justify-center">
                    <p className="flex flex-col gap-2">
                      <Spinner size="large" />
                    </p>
                  </div>
                ) : null}

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
              <div className="px-3 py-4 flex items-center justify-center">
                <span>{pdfName?.slice(0, 10) + ".pdf"}</span>
                {/* <Button
                  variant="secondary"
                  onClick={() => navigate(`/app/details/${id}`)}
                  size="micro"
                >
                  view details
                </Button> */}
              </div>
            </div>
          ))}
          {fetcher.state === "submitting" && fileUploadTracker ? (
            <div className="flex border bg-white rounded-lg shadow-md   items-center h-[200px] px-3 py-4 w-full justify-center">
              <p className="flex flex-col gap-2 items-center">
                <span className="font-semibold animate-pulse w-full p-1 ">
                  Uploading pdf
                </span>
                <Spinner size="large" />
              </p>
            </div>
          ) : null}
        </div>
      </Form>
    </Page>
  );
};

export default PDFConverter;

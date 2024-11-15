import {
  DropZone,
  LegacyStack,
  Text,
  Page,
  Button,
  Icon,
  Spinner,
  LegacyCard,
  EmptyState,
  InlineStack,
  ButtonGroup,
  Popover,
  ActionList,
  IndexTable,
  useIndexResourceState,
  Thumbnail,
  Box,
} from "@shopify/polaris";
import { ChevronDownIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  json,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import path from "path";
import {
  extractImagesFromPDF,
  generateRandomString,
  sleep,
  uploadImage,
} from "app/utils/utils";
import { apiVersion, authenticate } from "app/shopify.server";
import axios from "axios";
import fs from "fs";
import { PDFVALUES } from "app/constants/types";
import { Modal, TitleBar } from "@shopify/app-bridge-react";

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
    const pdfName: any = formData.get("pdfName") || pdf?.name || "Untitled PDF";
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

    const key = generateRandomString();

    const metafieldData = {
      namespace: "PDF",
      key: key,
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
  const loader: any = useLoaderData();
  const { pdfData } = useLoaderData<PDFVALUES>();
  const fetcher = useFetcher();
  console.log(loader, "LOADER");
  console.log(pdfData, "PDF DATA");
  const [deleteId, setDeleteId] = useState<any>();
  const [fileUploadTracker, setFileUploadTracker] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key);
      shopify.toast.show("Copied to clipboard");
      setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    });
  };

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

  const handlePdfDelete = (id: string) => {
    const metaFieldId = `gid://shopify/Metafield/${id}`;
    const formData = new FormData();
    formData.append("metafieldId", metaFieldId);
    fetcher.submit(formData, { method: "delete" });
    setFileUploadTracker(false);
    setDeleteId(id);
  };
  const navigate = useNavigate();

  console.log(fetcher, "Fetcher");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("pdf", file);
      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
    }
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(pdfData);
  console.log(selectedResources, "SELECTED REou");
  const rowMarkup =
    pdfData?.length &&
    pdfData?.map(({ id, pdfName, frontPage, key }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(deleteId)} //id
        onClick={() => setDeleteId(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            <div className="flex items-center text-xs font-normal text-gray-700 font- gap-2">
              <Thumbnail alt={pdfName} source={frontPage} size="small" />
              <span
                onClick={() => navigate(`/app/details/${id}`)}
                className="hover:underline"
              >
                {pdfName}
              </span>
            </div>
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>Jul 20 at 3:46pm</IndexTable.Cell>
        <IndexTable.Cell>600.65 KB</IndexTable.Cell>
        <IndexTable.Cell>
          <p
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleCopyKey(key)}
          >
            <span className="p-1 relative px-2 shadow-md text-xs text-blue-500 rounded-md cursor-pointer hover:bg-blue-100 capitalize transition-colors">
              {copiedKey === key ? "copied" : "copy key "}
            </span>
          </p>
        </IndexTable.Cell>
      </IndexTable.Row>
    ));
  const handleModalToggle = () => {
    shopify.modal.toggle("deleteModal");
  };
  const promotedBulkActions = [
    {
      destructive: true,
      content: "Delete PDF",
      onAction: handleModalToggle,
    },
  ];

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  console.log(deleteId, "DELETE ID");
  return (
    <Page
      backAction={{ content: "Settings", url: "/app" }}
      primaryAction={{
        loading: fetcher.state === "submitting",
        content: "Upload PDF",
        onAction: () => {
          fileInputRef.current?.click();
        },
      }}
      title="PDFs"
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
        name="pdf"
        id="pdfupload"
      />
      {/* Main section  */}
      <Modal id="deleteModal">
        <Box padding="300">
          <Text as="p">
            Are you sure you want to delete ? This cannot be undone.
          </Text>
        </Box>
        <TitleBar title="Delete">
          <button onClick={() => shopify.modal.hide("deleteModal")}>
            Cancel
          </button>
          <button
            variant="primary"
            onClick={() => {
              handlePdfDelete(deleteId);
              shopify.modal.hide("deleteModal");
            }}
            tone="critical"
          >
            Delete
          </button>
        </TitleBar>
      </Modal>
      {loader.error && fetcher.state !== "submitting" && !pdfData ? (
        <LegacyCard sectioned>
          <EmptyState
            heading="Manage your Pdfs"
            action={{
              content: "Upload PDF",
              onAction: () => {
                fileInputRef.current?.click();
              },
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              Manage and organize your PDF documents with ease, ensuring quick
              access and efficient storage.
            </p>
          </EmptyState>
        </LegacyCard>
      ) : (
        <Box paddingBlockEnd="400">
          <LegacyCard>
            <IndexTable
              resourceName={resourceName}
              itemCount={pdfData?.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources?.length
              }
              promotedBulkActions={promotedBulkActions}
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: "File Name" },
                { title: "Date" },
                { title: "Size" },
                { title: "PDF key" },
              ]}
              pagination={{
                hasNext: true,
                onNext: () => {},
              }}
            >
              {rowMarkup}
            </IndexTable>
          </LegacyCard>
        </Box>
      )}
    </Page>
  );
};

export default PDFConverter;

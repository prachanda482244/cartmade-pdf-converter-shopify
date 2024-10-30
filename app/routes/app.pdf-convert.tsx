import {
  json,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData, Form, useLoaderData } from "@remix-run/react";
import path from "path";
import PageFlip from "./app.pageflip";
import { extractImagesFromPDF, uploadImage } from "app/utils/utils";
import { apiVersion, authenticate } from "app/shopify.server";
import { useState } from "react";
import axios from "axios";
import fs from "fs";
import { PDFVALUES } from "app/constants/types";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

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
  const pdfName = formData.get("pdfName") || pdf.name || "Untitled PDF";

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
  imageUrls.forEach((url) => {
    const imagePath = path.join(process.cwd(), "public", url);
    fs.unlink(imagePath, (err) => {
      if (err) console.error(`Error deleting file ${imagePath}:`, err);
    });
  });

  console.log(uploadedImages);

  const metafieldData = {
    namespace: "PDF",
    key: "fields",
    value: JSON.stringify({
      pdfName: pdfName,

      images: uploadedImages.map((img, index) => ({
        id: index + 1,
        url: img,
        points: [],
      })),
    }),
    type: "json",
    owner_resource: "shop",
  };
  const { data } = await axios.post(
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

  return json({ images: uploadedImages, pdfName, metafiledData: data });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const GET_PDF_QUERY = `
  query GetPDFQuery {
    shop {
      metafield(namespace: "PDF", key: "fields") {
        id
        key
        value
        jsonValue
        type
        updatedAt
      }
    }
  }
`;
  try {
    const data = await admin.graphql(GET_PDF_QUERY);
    if (!data) return { error: "No data found" };
    const response = await data.json();
    if (!response.data) {
      console.error("GraphQL errors:", "Failed to fetch settings");
      return { error: "Failed to fetch PDF metafield." };
    }

    const PDFS = response?.data?.shop?.metafield;

    if (!PDFS) {
      console.warn("No button settings metafield found.");
      return { error: "Button settings metafield not found." };
    }

    return { pdfData: PDFS };
  } catch (error) {
    console.error("Error fetching button settings:", error);
    return { error: "Unexpected error occurred while fetching metafield." };
  }
};

const PDFConverter = () => {
  let {
    pdfData: { jsonValue, id },
  } = useLoaderData<PDFVALUES>();
  const [selectedFileName, setSelectedFileName] = useState("");
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 space-y-8 p-4">
      {!jsonValue && (
        <div>
          <h2 className="text-4xl font-bold mb-8 text-gray-800">
            PDF to Image Converter
          </h2>
          <Form
            method="post"
            encType="multipart/form-data"
            className="mb-8 w-full max-w-md space-y-4"
          >
            <input
              type="text"
              name="pdfName"
              placeholder="Enter a name for your PDF"
              className="w-full px-4 py-2 text-lg bg-blue-50 border border-blue-300 rounded-md focus:ring focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-500 rounded-lg py-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-blue-500 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-blue-500 font-medium">
                    {selectedFileName || "Click to upload PDF"}
                  </span>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                name="pdf"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                className="hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-lg transition"
            >
              Submit
            </button>
          </Form>
        </div>
      )}

      {jsonValue?.pdfName && (
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden p-4 space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Uploaded PDF Name: {jsonValue.pdfName}
          </h3>
        </div>
      )}

      {jsonValue?.images && (
        <PageFlip images={jsonValue.images} metaFieldId={id} />
      )}
    </div>
  );
};

export default PDFConverter;

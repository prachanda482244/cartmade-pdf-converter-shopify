import {
  json,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  ActionFunctionArgs,
} from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import path from "path";
import PageFlip from "./app.pageflip";
import { extractImagesFromPDF, uploadImage } from "app/utils/utils";
import { apiVersion, authenticate } from "app/shopify.server";
import { useState } from "react";
import axios from "axios";
import fs from "fs";

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
  const pdfName = formData.get("pdfName") || "Untitled PDF";

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

  console.log(readedUrls, "Readed ursl");

  // readedUrls.forEach((url) => {
  //   const imagePath = path.join(process.cwd(), "public", url);
  //   fs.unlink(imagePath, (err) => {
  //     if (err) console.error(`Error deleting file ${imagePath}:`, err);
  //   });
  // });

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
  console.log(createFileQueryResult.data.data.fileCreate, "MAIN IMAGE");
  return json({ images: uploadedImages, pdfName });
};

const PDFConverter = () => {
  const actionData = useActionData<any>();
  const [selectedFileName, setSelectedFileName] = useState("");
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 space-y-8 p-4">
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

      {actionData?.pdfName && (
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden p-4 space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Uploaded PDF Name: {actionData.pdfName}
          </h3>
        </div>
      )}

      {actionData?.images && <PageFlip images={actionData.images} />}
    </div>
  );
};

export default PDFConverter;

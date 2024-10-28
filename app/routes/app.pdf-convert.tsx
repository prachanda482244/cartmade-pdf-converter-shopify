import {
  json,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
} from "@remix-run/node";
import {
  useLoaderData,
  useFetcher,
  useActionData,
  Form,
} from "@remix-run/react";
import path from "path";
import PageFlip from "./app.pageflip";
import { extractImagesFromPDF, uploadToShopify } from "app/utils/utils";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: { request: Request }) => {
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

  if (!pdf) return json({ error: "No file uploaded" }, { status: 400 });

  const pdfPath = path.join(process.cwd(), "public", "uploads", pdf.name);
  const imageUrls = await extractImagesFromPDF(pdfPath);

  // const imagessss = await uploadToShopify(imageUrls, shop, accessToken);
  // console.log(imagessss, "IMAGESS RETURN");
  return json({ images: imageUrls });
};
export const loader = () => {
  return json({ images: [] });
};

const PDFConverter = () => {
  const actionData = useActionData<any>();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 space-y-8 p-4">
      <h2 className="text-4xl font-bold mb-8">PDF to Image Converter</h2>
      <Form method="post" encType="multipart/form-data" className="mb-8">
        <input
          type="text"
          name="pdfName"
          placeholder="PDF Name"
          className="bg-blue-800"
        />
        <input type="file" name="pdf" accept="application/pdf" required />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4"
        >
          Submit
        </button>
      </Form>
      {actionData?.images && actionData && (
        <PageFlip images={actionData?.images} />
      )}
      {/* <PageFlip /> */}
    </div>
  );
};

export default PDFConverter;

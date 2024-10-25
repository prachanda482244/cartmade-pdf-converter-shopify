import path from "path";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { extractImagesFromPDF } from "app/utils/utils";
import { motion } from "framer-motion";
import fs from "fs";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import PageFlip from "./app.pageflip";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const pdfFile = formData.get("pdf") as File;

  if (!pdfFile || pdfFile.type !== "application/pdf") {
    return json({ error: "Invalid PDF file." }, { status: 400 });
  }

  const tempDir = path.join("C:", "tmp");
  const tempPath = path.join(tempDir, pdfFile.name);

  await fs.promises.mkdir(tempDir, { recursive: true });

  await fs.promises.writeFile(
    tempPath,
    Buffer.from(await pdfFile.arrayBuffer()),
  );

  const images = await extractImagesFromPDF(tempPath);

  await fs.promises.unlink(tempPath);

  return json({ images });
};

const PDFConverter = () => {
  const actionData = useActionData<any>();

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 space-y-8 p-4">
      <h2 className="text-4xl font-bold mb-8">PDF to Image Converter</h2>

      <Form method="post" encType="multipart/form-data" className="mb-8">
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
    </div>
  );
};

export default PDFConverter;

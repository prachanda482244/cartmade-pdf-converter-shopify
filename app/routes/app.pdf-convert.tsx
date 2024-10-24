import { ActionFunctionArgs } from "@remix-run/node";
import { Form, json, useActionData } from "@remix-run/react";
import { PDFDocument, rgb, PDFName } from "pdf-lib";
import { writeFile } from "fs/promises";
import path from "path";
import { authenticate } from "app/shopify.server";
import { ActionPDFData } from "app/types/types";
import { useState } from "react";
import { Spinner } from "@shopify/polaris";
import { extractImagesFromPDF } from "app/utils/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const pdfFile = formData.get("pdf") as File;

  if (pdfFile && pdfFile.type === "application/pdf") {
    const pdfBytes = await pdfFile.arrayBuffer();
    const images = await extractImagesFromPDF(pdfBytes);

    return json({
      images,
    });
  }

  return json({ error: "Invalid PDF file." }, { status: 400 });
};

const PDFConverter = () => {
  const actionData: any = useActionData<ActionPDFData>();
  console.log(actionData);
  return (
    <div>
      <h2>PDF Converter</h2>
      <Form method="post" encType="multipart/form-data">
        <input type="file" name="pdf" accept="application/pdf" required />
        <br />
        <br />
        <button type="submit">Submit</button>
      </Form>

      {actionData?.images?.length > 0 && (
        <div>
          <h3>Extracted Images</h3>
          {actionData.images.map((imgSrc: any, index: number) => (
            <img
              key={index}
              src={imgSrc}
              alt={`Extracted Image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PDFConverter;

import { ActionFunctionArgs } from "@remix-run/node";
import { Form, json, useActionData } from "@remix-run/react";
import { PDFDocument, rgb, PDFName } from "pdf-lib";
import { writeFile } from "fs/promises";
import path from "path";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const pdfFile = formData.get("pdf") as File;

  if (pdfFile && pdfFile.type === "application/pdf") {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    const linkUrl = `https://${shop}/products/gift-card`;

    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPages()[i];

      console.log(page);
      const buttonX = page.getWidth() - 80;
      const buttonY = 10;

      page.drawRectangle({
        x: buttonX,
        y: buttonY,
        width: 70,
        height: 20,
        color: rgb(0, 0, 0),
      });

      page.drawText("Add to Cart", {
        x: buttonX + 5,
        y: buttonY + 5,
        size: 10,
        color: rgb(1, 1, 1),
      });

      const link = pdfDoc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [buttonX, buttonY, buttonX + 70, buttonY + 20],
        Border: [0, 0, 0],
        A: {
          S: "URI",
          URI: linkUrl,
        },
      });

      const annotations =
        page.node.get(PDFName.of("Annots")) || pdfDoc.context.obj([]);
      if (Array.isArray(annotations)) {
        annotations.push(link);
        page.node.set(PDFName.of("Annots"), annotations);
      } else {
        page.node.set(PDFName.of("Annots"), pdfDoc.context.obj([link]));
      }
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfPath = path.join("public", "modified-file.pdf");
    await writeFile(modifiedPdfPath, modifiedPdfBytes);
    return json({
      modifiedPdfUrl: `/modified-file.pdf`,
    });
  }

  return json({ error: "Invalid PDF file." }, { status: 400 });
};

const PDFConverter = () => {
  const actionData: any = useActionData();
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
      {actionData?.modifiedPdfUrl && (
        <a
          href={actionData.modifiedPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Modified PDF
        </a>
      )}
    </div>
  );
};

export default PDFConverter;

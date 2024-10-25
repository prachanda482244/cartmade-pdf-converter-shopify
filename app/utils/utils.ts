import poppler from "pdf-poppler";
import path from "path";
import fs from "fs";

export const extractImagesFromPDF = async (
  pdfPath: string,
): Promise<string[]> => {
  const outputDir = path.dirname(pdfPath);
  const outputPrefix = path.basename(pdfPath, path.extname(pdfPath));
  const outputFormat = "jpeg";

  const options = {
    format: outputFormat,
    out_dir: outputDir,
    out_prefix: outputPrefix,
    page: null,
  };

  try {
    await poppler.convert(pdfPath, options);

    const imageFiles = fs
      .readdirSync(outputDir)
      .filter((file) => {
        return file.startsWith(outputPrefix);
      }) //&& file.endsWith(`.${outputFormat}`)
      .map((file) => path.join(outputDir, file));

    const base64Images = await Promise.all(
      imageFiles.slice(0, -1).map(async (filePath) => {
        const imageBuffer = await fs.promises.readFile(filePath);
        return `data:image/${outputFormat};base64,${imageBuffer.toString("base64")}`;
      }),
    );

    return base64Images;
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw new Error("PDF conversion failed");
  }
};

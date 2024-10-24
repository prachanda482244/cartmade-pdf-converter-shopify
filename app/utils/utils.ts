import { getDocument } from "pdfjs-dist/";
import * as pdfjsLib from "pdfjs-dist";

export const extractImagesFromPDF = async (pdfBytes: any) => {
  const loadingTask = getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const images = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);

    const operatorList = await page.getOperatorList();
    for (let j = 0; j < operatorList.fnArray.length; j++) {
      if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
        const imageName = operatorList.argsArray[j][0];
        const image = await page.commonObjs.get(imageName);
        if (image) {
          const imgDataUrl = convertImageToDataUrl(image);
          images.push(imgDataUrl);
        }
      }
    }
  }

  return images;
};

const convertImageToDataUrl = (image: any) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;

  const imageData = new ImageData(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height,
  );
  if (!context) return;
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
};

import poppler from "pdf-poppler";
import path from "path";
import fs from "fs/promises";
import axios from "axios";

// export const extractImagesFromPDFS = async (
//   pdfPath: string,
// ): Promise<string[]> => {
//   const outputDir = path.dirname(pdfPath);
//   const outputPrefix = path.basename(pdfPath, path.extname(pdfPath));
//   const outputFormat = "png";

//   const options = {
//     format: outputFormat,
//     out_dir: outputDir,
//     out_prefix: outputPrefix,
//     page: null,
//   };

//   try {
//     await poppler.convert(pdfPath, options);

//     const imageFiles = fs
//       .readdirSync(outputDir)
//       .filter(
//         (file) => file.startsWith(outputPrefix), //&& file.endsWith(`.${outputFormat}`,
//       )
//       .map((file) => path.join(outputDir, file))
//       .filter((img) => img.endsWith(".png"));

//     return imageFiles;
//   } catch (error) {
//     console.error("Error converting PDF to images:", error);
//     throw new Error("PDF conversion failed");
//   }
// };

export const extractImagesFromPDF = async (
  pdfPath: string,
): Promise<string[]> => {
  const outputDir = path.join(process.cwd(), "public", "uploads");
  const outputPrefix = path.basename(pdfPath, path.extname(pdfPath));
  const outputFormat = "png";

  const options = {
    format: outputFormat,
    out_dir: outputDir,
    out_prefix: outputPrefix,
    page: null,
  };

  await poppler.convert(pdfPath, options);

  const files = await fs.readdir(outputDir);
  return files
    .filter((file) => file.startsWith(outputPrefix) && file.endsWith(".png"))
    .map((file) => `/uploads/${file}`);
};
export const uploadToShopify = async (
  imagePaths: string[],
  shop: string,
  accessToken: string,
) => {
  const uploadPromises = imagePaths.map(async (imagePath: string) => {
    try {
      const imageBuffer = await fs.readFile(
        path.join(process.cwd(), "public", imagePath),
      );

      const base64Image = imageBuffer.toString("base64");

      const query = `
     mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            fileStatus
            alt
            createdAt
          }
        }
}
      `;

      const variables = {
        files: [
          {
            alt: "PDF extracted image",
            contentType: "IMAGE",
            originalSource: `data:image/png;base64,${base64Image}`,
          },
        ],
      };

      const response = await axios.post(
        `https://${shop}/admin/api/2024-10/graphql.json`,
        { query, variables },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
        },
      );

      console.log(response.data, "RESPONSE");
      console.log(response.data.errors, "RESPONSE ERROR");
      // if (response.data.data.fileCreate.userErrors.length) {
      //   throw new Error(response.data.data.fileCreate.userErrors[0].message);
      // }

      // return response.data.data.fileCreate.files[0].originalSource;
      return "11";
    } catch (error: any) {
      console.error(`Error uploading image at ${imagePath}:`, error.message);
      throw error;
    }
  });

  // Wait for all uploads to finish
  return Promise.all(uploadPromises);
};

export const uploadImage = async (
  imageBuffer: any,
  shop: string,
  accessToken: any,
  apiVersion: string,
) => {
  const stagedUploadsQuery = `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        resourceUrl
        url
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const stagedUploadsVariables = {
    input: {
      filename: "image.jpg",
      httpMethod: "POST",
      mimeType: "image/jpeg",
      resource: "FILE",
    },
  };

  const stagedUploadsQueryResult = await axios.post(
    `https://${shop}/admin/api/${apiVersion}/graphql.json`,
    {
      query: stagedUploadsQuery,
      variables: stagedUploadsVariables,
    },
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    },
  );

  const target =
    stagedUploadsQueryResult.data.data.stagedUploadsCreate.stagedTargets[0];
  const params = target.parameters;
  const url = target.url;
  const resourceUrl = target.resourceUrl;

  const form = new FormData();
  params.forEach(({ name, value }: any) => {
    form.append(name, value);
  });

  form.append("file", new Blob([imageBuffer]), `image-${Date.now()}.jpg`);

  await axios.post(url, form, {
    headers: {
      "Content-Type": "multipart/form-data",
      "X-Shopify-Access-Token": accessToken,
    },
  });

  return resourceUrl;
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

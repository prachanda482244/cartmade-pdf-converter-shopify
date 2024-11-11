import { json } from "@remix-run/react";
import { apiVersion, authenticate } from "app/shopify.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useLoaderData,
} from "react-router";
import { IMAGES, SINGLEPDF } from "app/constants/types";
import PageFlip from "app/components/PageFlip";
import axios from "axios";
import { error } from "console";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  const { admin } = await authenticate.admin(request);
  const metafieldId = `gid://shopify/Metafield/${id}`;
  console.log("Loader: id fetched from URL", id);
  const META_FIELD_QUERY = `
  query getMetafield($id: ID!) {
    node(id: $id) {
      ... on Metafield {
        id
        namespace
        key
        value
        jsonValue
        type
      }
    }
  }
`;

  const response = await admin.graphql(META_FIELD_QUERY, {
    variables: {
      id: metafieldId,
    },
  });
  {
    try {
      const { data } = await response.json();
      if (!data) {
        console.warn("No PDF metafield found.");
        return { error: "Pdf not found." };
      }
      const pdfData = {
        id: data.node.id,
        pdfName: data.node.jsonValue.pdfName,
        images: data.node.jsonValue.images,
      };
      return json({ pdfData });
    } catch (error) {
      console.error("Error fetching PDF metafields:", error);
      return { error: "Unexpected error occurred while fetching metafield." };
    }
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "post") {
    const {
      session: { accessToken, shop },
      admin,
      session,
    } = await authenticate.admin(request);
    const url = new URL(request.url);
    const id = Number(url.pathname.split("/").pop());
    const formdata: any = await request.formData();
    const images = formdata.get("images");
    const pdfName = formdata.get("pdfName");
    console.log(images, "IMAGEs");
    console.log(typeof images === "string", "TYPe oF IMAGEs");
    console.log(pdfName, "NAMEs");
    if (typeof images !== "string") {
      return {
        error: "Invalid image data. Please upload valid images.",
        images,
        pdfName,
      };
    } else {
      const metafield = new admin.rest.resources.Metafield({
        session: session,
      });
      metafield.id = id;
      metafield.value = JSON.stringify({
        pdfName: pdfName || "Undefined",
        images: JSON.parse(images) || [],
      });
      metafield.type = "json";

      await metafield.save({
        update: true,
      });
      // console.log(metafield, "metafield after update");

      if (!metafield) {
        console.warn("Failed to save metafield");
        return { error: "Failed to save metafield" };
      }
      return {
        success: true,
        message: "metafield updated successfully",
        metafield,
      };
    }
  }
};
const DetailPage = () => {
  // const { pdfData } = useLoaderData<SINGLEPDF>();
  const { pdfData }: any = useLoaderData();
  return (
    <div>
      <PageFlip
        pdfName={pdfData.pdfName}
        images={pdfData.images}
        metaFieldId={pdfData.id}
      />
    </div>
  );
};

export default DetailPage;

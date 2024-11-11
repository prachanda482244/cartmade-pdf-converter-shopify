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
  const {
    session: { accessToken, shop },
  } = await authenticate.admin(request);
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  const formdata: any = await request.formData();
  const images = formdata.get("images");

  const { data: metafieldData } = await axios.get(
    `https://${shop}/admin/api/${apiVersion}/metafields/${id}.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    },
  );

  console.log(metafieldData, "GET METAFIELD");

  const updatedData = {
    ...metafieldData,
    metafield: {
      value: JSON.stringify({
        images: images,
      }),
      type: "json",
    },
  };
  // const { data } = await axios.put(
  //   `https://${shop}/admin/api/${apiVersion}/metafields/${id}.json`,

  //   updatedData,
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-Shopify-Access-Token": accessToken,
  //     },
  //   },
  // );

  // console.log(data, "updated metafield");
  let data: any = [];
  if (!data) {
    console.warn("Failed to save metafield");
    return { error: "Failed to save metafield" };
  }
  return {
    success: true,
    message: "metafield updated successfully",
    metafieldData,
  };
};
const DetailPage = () => {
  // const { pdfData } = useLoaderData<SINGLEPDF>();
  const { pdfData }: any = useLoaderData();
  return (
    <div>
      <PageFlip images={pdfData.images} metaFieldId={pdfData.id} />
    </div>
  );
};

export default DetailPage;

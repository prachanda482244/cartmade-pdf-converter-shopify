import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return "hello world";
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    console.log(session, "Session");
    //   const metafield = new admin.rest.resources.Metafield({ session: session });
    //   console.log(metafield, "metafield");
    const { metaFieldId, images } = await request.json();
    console.log(metaFieldId, "meta");

    return { success: true, metaFieldId };
  } catch (error) {
    console.log(error, "error");
    return { error: "Unexpected error occurred while saving settings." };
  }
};

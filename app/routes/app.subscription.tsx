import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { authenticate } from "app/shopify.server";
import { useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const redirectUrl = `https://admin.shopify.com/store/${shop.replace(".myshopify.com", "")}/charges/PDF-CONVERTER/pricing_plans`;
  return { redirectUrl };
};
const subscription = () => {
  const { redirectUrl }: { redirectUrl: string } = useLoaderData();
  // const navigate = useNavigate();
  useEffect(() => {
    window.location.href = redirectUrl;
  }, [redirectUrl]);
  return <></>;
};

export default subscription;

import { useEffect } from "react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  return json({ shop });
};
export default function Subscription() {
  const { shop } = useLoaderData<typeof loader>();
  useEffect(function () {
    window.parent.location.href = `https://admin.shopify.com/store/${shop.replaceAll(".myshopify.com", "")}/charges/pdf-converter/pricing_plans`;
  }, []);
}

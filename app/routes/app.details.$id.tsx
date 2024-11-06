import { useParams } from "@remix-run/react";
import { ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Parse the URL to extract the 'id' parameter
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop(); // Assuming your URL is like /detail/:id

  console.log("Action: id fetched from URL", id); // Log the ID

  // Now you can use 'id' as needed in your action function

  return { success: true };
};

const DetailPage = () => {
  const { id } = useParams();
  console.log("DetailPage: ID from useParams", id);

  return <div>Detail page {id}</div>;
};

export default DetailPage;

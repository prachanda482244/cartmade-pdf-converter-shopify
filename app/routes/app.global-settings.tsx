import { Button, ButtonGroup, Page } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { buttonsName } from "app/config/config";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { apiVersion, authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { accessToken, shop }: any = session;

  if (request.method === "POST") {
    const formData = await request.formData();

    const buttonText = formData.get("buttonText") as string;
    const icon = formData.get("icon") as string;
    const fontSize = formData.get("fontSize") as string;
    const borderRadius = formData.get("borderRadius") as string;
    const borderWidth = formData.get("borderWidth") as string;
    const borderColor = formData.get("borderColor") as string;
    const backgroundColor = formData.get("backgroundColor") as string;
    const textColor = formData.get("textColor") as string;

    const metafieldData = {
      namespace: "cartmade",
      key: "cod_button_settings",
      value: JSON.stringify({
        buttonText,
        icon,
        fontSize: parseInt(fontSize),
        borderRadius: parseInt(borderRadius),
        borderWidth: parseInt(borderWidth),
        borderColor,
        backgroundColor,
        textColor,
      }),
      type: "json",
      owner_resource: "shop",
    };

    const response = await fetch(
      `https://${shop}/admin/api/${apiVersion}/metafields.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ metafield: metafieldData }),
      },
    );

    const responseData = await response.json();
    if (!response.ok) {
      return json(
        { error: responseData.errors || "Failed to save metafield" },
        { status: response.status },
      );
    }
    return json({
      message: "Public metafield saved successfully",
      data: responseData,
    });
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const GET_BUTTON_SETTINGS_QUERY = `
  query GetButtonSettings {
    shop {
      metafield(namespace: "cartmade", key: "cod_button_settings") {
        id
        key
        value
        jsonValue
        type
        updatedAt
      }
    }
  }
`;

  try {
    const data = await admin.graphql(GET_BUTTON_SETTINGS_QUERY);
    if (!data) return { error: "No data found" };
    const response = await data.json();
    if (!response.data) {
      console.error("GraphQL errors:", "Failed to fetch settings");
      return { error: "Failed to fetch button settings metafield." };
    }

    const buttonSettings = response?.data?.shop?.metafield;

    if (!buttonSettings) {
      console.warn("No button settings metafield found.");
      return { error: "Button settings metafield not found." };
    }

    return { buttonSettings };
  } catch (error) {
    console.error("Error fetching button settings:", error);
    return { error: "Unexpected error occurred while fetching metafield." };
  }
};

const GlobalSettings = () => {
  const [activeButton, setActiveButton] = useState<string>("app");
  const loaderData = useLoaderData<any>();
  const handleButtonClick = useCallback(
    (link: string) => {
      if (activeButton === link) return;
      setActiveButton(link);
    },
    [activeButton],
  );

  const buttonSettings = loaderData?.buttonSettings || {};

  const ActiveComponent = buttonsName.find(
    ({ link }) => link === activeButton,
  )?.component;

  return (
    <Page title="Global Settings">
      <ButtonGroup variant="segmented" gap="loose">
        {buttonsName &&
          buttonsName.length &&
          buttonsName.map(({ index, name, link }) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(link)}
              pressed={link === activeButton}
            >
              {name}
            </Button>
          ))}
      </ButtonGroup>

      <div className="mt-6">
        {" "}
        {ActiveComponent && activeButton === "buttonDesign" && (
          <ActiveComponent buttonSettings={buttonSettings} />
        )}
        {ActiveComponent && activeButton !== "buttonDesign" && (
          <ActiveComponent />
        )}
      </div>
    </Page>
  );
};

export default GlobalSettings;

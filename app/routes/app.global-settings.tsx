import { Button, ButtonGroup, Page } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { buttonsName } from "app/config/config";
import { buttonsNameTypes } from "app/constants/types";

const GlobalSettings = () => {
  const [activeButton, setActiveButton] = useState<string>("app");

  const handleButtonClick = useCallback(
    (link: string) => {
      if (activeButton === link) return;
      setActiveButton(link);
    },
    [activeButton],
  );

  const ActiveComponent = buttonsName.find(
    ({ link }) => link === activeButton,
  )?.component;

  return (
    <Page
      title="Global Settings"
      primaryAction={{
        content: "Save",
        onAction: () => {
          alert("Settings saved successfully");
        },
      }}
    >
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

      <div className="mt-6">{ActiveComponent && <ActiveComponent />}</div>
    </Page>
  );
};

export default GlobalSettings;

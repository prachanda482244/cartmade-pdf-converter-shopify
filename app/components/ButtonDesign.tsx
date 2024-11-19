import React, { useState } from "react";
import { Button, Modal, TextField, Card, BlockStack } from "@shopify/polaris";

// Define the properties for a hotspot button
interface HotspotProps {
  id: string;
  svg: string; // SVG string for the button design
  color: string; // Color for the button
  hoverColor: string; // Hover color
  label: string; // Label for hover effect
}

// Define a set of pre-designed buttons (SVGs)
const buttonDesigns: HotspotProps[] = [
  {
    id: "button-1",
    svg: '<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="25" fill="currentColor" /></svg>',
    color: "#007c68", // Primary Green
    hoverColor: "#005d4a", // Darker Green on Hover
    label: "Green Circle",
  },
  {
    id: "button-2",
    svg: '<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><rect width="50" height="50" fill="currentColor" /></svg>',
    color: "#f0a500", // Orange
    hoverColor: "#d77c00", // Darker Orange on Hover
    label: "Orange Square",
  },
  {
    id: "button-3",
    svg: '<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><polygon points="25,0 50,50 0,50" fill="currentColor" /></svg>',
    color: "#6b42f5", // Purple
    hoverColor: "#4b2d99", // Darker Purple on Hover
    label: "Purple Triangle",
  },
  {
    id: "button-4",
    svg: '<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><ellipse cx="25" cy="25" rx="25" ry="25" fill="currentColor" /></svg>',
    color: "#ff4f00", // Red-Orange
    hoverColor: "#cc3b00", // Darker Red-Orange on Hover
    label: "Red Ellipse",
  },
  {
    id: "button-5",
    svg: '<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><rect width="50" height="50" rx="10" ry="10" fill="currentColor" /></svg>',
    color: "#00bcd4", // Teal
    hoverColor: "#008c9e", // Darker Teal on Hover
    label: "Teal Rounded Square",
  },
];

const ButtonDesign = () => {
  const [active, setActive] = useState(false);
  const [selectedButton, setSelectedButton] = useState<HotspotProps | null>(
    null,
  );
  const [buttonColor, setButtonColor] = useState<string>("");

  const handleButtonSelect = (button: HotspotProps) => {
    setSelectedButton(button);
    setButtonColor(button.color);
  };

  const toggleModal = () => setActive(!active);

  const handleSave = () => {
    console.log("Hotspot settings saved:", selectedButton);
    toggleModal();
  };

  return (
    <div className="space-y-6 p-8 bg-gray-50 rounded-lg shadow-lg">
      {/* Button Selection Section */}
      <Card>
        <BlockStack align="center">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {buttonDesigns.map((button) => (
              <div
                key={button.id}
                onClick={() => handleButtonSelect(button)}
                className={`cursor-pointer p-4 rounded-lg border-1 w-1/2 border-gray-300 flex items-center justify-center  hover:border-gray-500 transition-all transform hover:scale-110 shadow-lg relative ${
                  selectedButton?.id === button.id ? "bg-gray-100" : "bg-white"
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: button.svg }}
                  className="m-auto "
                  style={{
                    width: "50px",
                    height: "50px",
                    color: button.color,
                    transition: "all 0.3s ease",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 ">
            <Button variant="primary" onClick={toggleModal}>
              Customize Selected Button
            </Button>
          </div>
        </BlockStack>
      </Card>

      {selectedButton && (
        <Modal
          open={active}
          onClose={toggleModal}
          title="Edit Button Design"
          primaryAction={{
            content: "Save",
            onAction: handleSave,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: toggleModal,
            },
          ]}
        >
          <Modal.Section>
            <TextField
              label="Button Color"
              type="color"
              value={buttonColor}
              onChange={(newColor) => setButtonColor(newColor)}
            />
          </Modal.Section>
        </Modal>
      )}

      {/* Button Preview */}
      {selectedButton && (
        <Card>
          <div className="relative p-6 bg-white rounded-lg border border-gray-300 flex justify-center items-center space-y-4 hover:shadow-lg transition-all">
            <div
              dangerouslySetInnerHTML={{ __html: selectedButton.svg }}
              className="m-auto transition-all transform duration-500"
              style={{
                width: "80px",
                height: "80px",
                color: buttonColor,
              }}
            />
            <div className="mt-2 text-center text-sm text-gray-700 font-semibold">
              Preview
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ButtonDesign;

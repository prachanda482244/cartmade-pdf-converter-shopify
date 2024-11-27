import React, { useState } from "react";
import {
  Button,
  Modal,
  TextField,
  Card,
  BlockStack,
  FormLayout,
  hsbToHex,
  Layout,
  Popover,
  Checkbox,
  ColorPicker,
  RangeSlider,
  Page,
} from "@shopify/polaris";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { buttonDesigns, iconItems } from "app/config/config";
import { HotspotProps, IconItems } from "app/constants/types";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { apiVersion, authenticate } from "app/shopify.server";

const ButtonDesign = ({ buttonSettings: { jsonValue } }: any) => {
  const fetcher = useFetcher();
  const [buttonText, setButtonText] = useState(
    jsonValue?.buttonText || "Add to cart",
  );

  const [icon, setIcon] = useState("");
  const [iconName, setIconName] = useState<string>("");

  const [fontSize, setFontSize] = useState<number>(jsonValue?.fontSize || 15);
  const [borderRadius, setBorderRadius] = useState<number>(
    jsonValue?.borderRadius || 4,
  );
  const [borderWidth, setBorderWidth] = useState<number>(
    jsonValue?.borderWidth || 0,
  );

  const [borderColor, setBorderColor] = useState({
    hue: 0,
    saturation: 0,
    brightness: 0,
  });
  const [backgroundColor, setBackgroundColor] = useState({
    hue: 240,
    saturation: 0,
    brightness: 0,
  });
  const [textColor, setTextColor] = useState({
    hue: 0,
    brightness: 1,
    saturation: 0,
  });

  const handleButtonTextChange = (value: string) => setButtonText(value);
  const handleIconChange = (icon: string, value: string, name: string) => {
    value === "x" ? setIcon("") : setIcon(icon);
    name === "Xicon" ? setIconName("") : setIconName(name);
    setLabel(value);
  };
  const [label, setLabel] = useState("");
  const [bgPopoverActive, setBgPopoverActive] = useState(false);
  const [textPopoverActive, setTextPopoverActive] = useState(false);
  const [borderPopoverActive, setBorderPopoverActive] = useState(false);

  const toggleBgPopoverActive = () => setBgPopoverActive((active) => !active);
  const toggleTextPopoverActive = () =>
    setTextPopoverActive((active) => !active);
  const toggleBorderPopoverActive = () =>
    setBorderPopoverActive((active) => !active);

  const bgHexColor = hsbToHex(backgroundColor) || jsonValue?.backgroundColor;
  const textHexColor = hsbToHex(textColor) || jsonValue?.textColor;
  const borderHexColor = hsbToHex(borderColor) || jsonValue?.borderColor;

  const handleBgColorChange = (newColor: any) => setBackgroundColor(newColor);
  const handleTextColorChange = (newColor: any) => setTextColor(newColor);
  const handleBorderColorChange = (newColor: any) => setBorderColor(newColor);

  const handleFontSizeChange = (value: number) => setFontSize(value);
  const handleBorderRadiusChange = (value: number) => setBorderRadius(value);
  const handleBorderWidthChange = (value: number) => setBorderWidth(value);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("buttonText", buttonText);
    formData.append("icon", iconName);
    formData.append("fontSize", fontSize.toString());
    formData.append("borderRadius", borderRadius.toString());
    formData.append("borderWidth", borderWidth.toString());

    formData.append("borderColor", borderHexColor);
    formData.append("backgroundColor", bgHexColor);
    formData.append("textColor", textHexColor);
    fetcher.submit(formData, { method: "post" });
  };

  if (fetcher.state === "loading") {
    shopify.toast.show("Setting saved successfully");
  }

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
    <Page
      primaryAction={{
        content: "Save",
        onAction: handleSubmit,
        loading: fetcher.state === "submitting",
      }}
    >
      <div className="space-y-6 p-8 bg-gray-50 rounded-lg shadow-lg">
        {/* Button Selection Section */}
        <p>Hotspot settings</p>
        <Card>
          <BlockStack align="center">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
              {buttonDesigns?.map((button) => (
                <div
                  key={button.id}
                  onClick={() => handleButtonSelect(button)}
                  className={`cursor-pointer p-4 rounded-lg border-1 w-1/2 border-gray-300 flex items-center justify-center hover:border-gray-500 transition-all transform hover:scale-110 shadow-lg relative ${
                    selectedButton?.id === button.id
                      ? "bg-gray-100"
                      : "bg-white"
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: button.svg }}
                    className="m-auto"
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
            <div className="mt-2">
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

        <div className="">
          <p>Button settings</p>

          <Layout.Section variant={"fullWidth"}>
            <Card>
              <FormLayout>
                <TextField
                  autoComplete="true"
                  label="Button text"
                  value={buttonText}
                  onChange={handleButtonTextChange}
                />
                <div style={{ marginBottom: "10px" }}>
                  <p>Select an icon:</p>
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    {iconItems &&
                      iconItems.length &&
                      iconItems.map(
                        ({ label: labelName, icon, name }: IconItems) => (
                          <Button
                            key={labelName}
                            icon={icon}
                            onClick={() =>
                              handleIconChange(icon, labelName, name)
                            }
                            pressed={labelName === label}
                          />
                        ),
                      )}
                  </div>
                </div>
                <FormLayout.Group>
                  <div>
                    <p>Background color</p>
                    <div className="p-2 border border-black w-14 flex items-center justify-center">
                      <Popover
                        active={bgPopoverActive}
                        activator={
                          <div
                            onClick={toggleBgPopoverActive}
                            className="w-12 h-6 rounded-sm cursor-pointer border-1 border-[#ccc]"
                            style={{
                              backgroundColor: bgHexColor,
                            }}
                          />
                        }
                        onClose={toggleBgPopoverActive}
                        preferredAlignment="center"
                      >
                        <div style={{ padding: "1rem" }}>
                          <ColorPicker
                            onChange={handleBgColorChange}
                            color={backgroundColor}
                            allowAlpha={false}
                          />
                        </div>
                      </Popover>
                    </div>

                    <p>Text color</p>

                    <div className="p-2 border border-black w-14 flex items-center justify-center">
                      <Popover
                        active={textPopoverActive}
                        activator={
                          <div
                            onClick={toggleTextPopoverActive}
                            className="w-12 h-6 rounded-sm cursor-pointer border-1 border-[#ccc]"
                            style={{
                              backgroundColor: textHexColor,
                            }}
                          />
                        }
                        onClose={toggleTextPopoverActive}
                        preferredAlignment="center"
                      >
                        <div style={{ padding: "1rem" }}>
                          <ColorPicker
                            onChange={handleTextColorChange}
                            color={textColor}
                            allowAlpha={false}
                          />
                        </div>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <RangeSlider
                      label="Font size"
                      value={fontSize}
                      min={15}
                      max={30}
                      onChange={handleFontSizeChange}
                      output
                    />
                    <RangeSlider
                      label="Border radius"
                      value={borderRadius}
                      min={1}
                      max={15}
                      onChange={handleBorderRadiusChange}
                      output
                    />
                    <RangeSlider
                      label="Border width"
                      min={0}
                      max={15}
                      value={borderWidth}
                      onChange={handleBorderWidthChange}
                      output
                    />

                    <div>
                      <p>Border color</p>

                      <div className="p-2 border border-black w-14 flex items-center justify-center">
                        <Popover
                          active={borderPopoverActive}
                          activator={
                            <div
                              onClick={toggleBorderPopoverActive}
                              className="w-12 h-6 rounded-sm cursor-pointer border-1 border-[#ccc]"
                              style={{
                                backgroundColor: borderHexColor,
                              }}
                            />
                          }
                          onClose={toggleBorderPopoverActive}
                          preferredAlignment="center"
                        >
                          <div style={{ padding: "1rem" }}>
                            <ColorPicker
                              onChange={handleBorderColorChange}
                              color={borderColor}
                              allowAlpha={false}
                            />
                          </div>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </FormLayout.Group>
              </FormLayout>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <div
              style={{
                marginBottom: "15px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              Live preview:
            </div>
            <Card>
              <div
                style={{
                  borderWidth,
                  borderColor: borderHexColor,
                  borderRadius,
                  background: borderHexColor,
                }}
              >
                <button
                  className="overflow-hidden Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--fullWidth Polaris-Button--iconWithText  "
                  type="button"
                  style={{
                    backgroundColor: bgHexColor,
                    color: textHexColor,
                    fontWeight: 400,
                    borderRadius,
                    borderWidth,
                    borderColor: borderHexColor,
                  }}
                >
                  <span className="Polaris-Button__Icon text-black">
                    <span
                      className="Polaris-Icon "
                      // style={{ color: textHexColor }}
                    >
                      {icon}
                    </span>
                  </span>
                  <span
                    style={{ fontSize }}
                    className="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium flex flex-col"
                  >
                    {buttonText}
                  </span>
                </button>
              </div>
            </Card>
          </Layout.Section>
        </div>
      </div>
    </Page>
  );
};

export default ButtonDesign;

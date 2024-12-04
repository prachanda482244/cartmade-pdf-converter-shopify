import { useState } from "react";
import {
  TextField,
  Card,
  BlockStack,
  Layout,
  RangeSlider,
  Page,
} from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";
import HotspotButton from "./polaris-components/HotspotButton";
import InputColorPicker from "./InputColorPicker";

const ButtonDesign = ({ buttonSettings: { jsonValue } }: any) => {
  console.log(jsonValue, "JSON");
  const fetcher = useFetcher();
  const [buttonText, setButtonText] = useState(
    jsonValue?.buttonText || "Add to cart",
  );
  const [fontSize, setFontSize] = useState<number>(jsonValue?.fontSize || 15);
  const [paddingY, setPaddingY] = useState<number>(jsonValue?.paddingY || 0);
  const [paddingX, setPaddingX] = useState<number>(jsonValue?.paddingX || 0);
  const [hotspotValue, setHotspotValue] = useState<number>(
    jsonValue?.hotspotColor || 0,
  );
  const [shadow, setShadow] = useState<number>(jsonValue?.shadow || 0);
  const [borderRadius, setBorderRadius] = useState<number>(
    jsonValue?.borderRadius || 4,
  );
  const [borderWidth, setBorderWidth] = useState<number>(
    jsonValue?.borderWidth || 0,
  );
  const [hotspotColor, setHotspotColor] = useState(
    jsonValue?.hotspotColor || "#a34423",
  );

  const [borderColor, setBorderColor] = useState(
    jsonValue?.borderColor || "#ffffff",
  );
  const [shadowColor, setShadowColor] = useState(
    jsonValue?.shadowColor || "#345acd",
  );
  const [backgroundColor, setBackgroundColor] = useState(
    jsonValue?.backgroundColor || "#000000",
  );
  const [textColor, setTextColor] = useState("#fff433");

  const handleButtonTextChange = (value: string) => setButtonText(value);
  const handleFontSizeChange = (value: number) => setFontSize(value);
  const handleHotspotSizeChange = (value: number) => setHotspotValue(value);
  const handlePaddingYChange = (value: number) => setPaddingY(value);
  const handlePaddingXChange = (value: number) => setPaddingX(value);
  const handleShadowChange = (value: number) => setShadow(value);
  const handleBorderRadiusChange = (value: number) => setBorderRadius(value);
  const handleBorderWidthChange = (value: number) => setBorderWidth(value);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("source", "ButtonDesign");
    formData.append("buttonText", buttonText);
    formData.append("fontSize", fontSize.toString());
    formData.append("borderRadius", borderRadius.toString());
    formData.append("borderWidth", borderWidth.toString());

    formData.append("borderColor", borderColor);
    formData.append("backgroundColor", backgroundColor);
    formData.append("textColor", textColor);
    formData.append("paddingY", paddingY.toString());
    formData.append("paddingX", paddingX.toString());
    formData.append("shadow", shadow.toString());
    formData.append("shadowColor", shadowColor);
    formData.append("hotspotColor", hotspotColor);

    fetcher.submit(formData, { method: "post" });
  };

  if (fetcher.state === "loading") {
    shopify.toast.show("Button setting saved successfully");
  }

  return (
    <Page
      primaryAction={{
        content: "Save",
        onAction: handleSubmit,
        loading: fetcher.state === "submitting",
      }}
    >
      <div className="space-y-6 p-8 bg-gray-50 rounded-lg shadow-lg">
        <p>Hotspot settings</p>
        <div className="w-1/2">
          <Card>
            <BlockStack align="center">
              <div className="flex flex-col gap-3">
                <InputColorPicker
                  title="Hotspot Color"
                  setState={setHotspotColor}
                  value={hotspotColor}
                />

                <div className="flex items-center justify-between  gap-4 ">
                  <div className="w-[30%]">
                    <RangeSlider
                      label="Hotspot size"
                      value={hotspotValue}
                      min={0}
                      max={20}
                      onChange={handleHotspotSizeChange}
                      output
                    />
                  </div>

                  <div className="grid   grid-cols-2 h-12 gap-6 sm:grid-cols-3 md:grid-cols-5">
                    <div
                      className="image-hotspots--pin mt-6 ml-20 absolute flex justify-center items-center text-white text-sm h-9 w-9 rounded-full shadow-lg cursor-pointer animate-pulse"
                      style={{
                        backgroundColor: hotspotColor,
                      }}
                    >
                      <HotspotButton />
                    </div>
                  </div>
                </div>
              </div>
            </BlockStack>
          </Card>
        </div>

        {/* Button Preview */}

        <div className="">
          <Card>
            <div className="button-settings-wrapper flex flex-wrap gap-4">
              <div className="flex border-0  sm:border-r-2 sm:pr-4 flex-col gap-3 button-settings-item">
                <div className="max-w-[264px]">
                  <TextField
                    size="slim"
                    autoComplete="true"
                    label="Button Settings"
                    value={buttonText}
                    onChange={handleButtonTextChange}
                  />
                </div>

                <InputColorPicker
                  title="Background Color"
                  setState={setBackgroundColor}
                  value={backgroundColor}
                />

                <InputColorPicker
                  title="Text Color"
                  setState={setTextColor}
                  value={textColor}
                />
                <InputColorPicker
                  title="Shadow Color"
                  setState={setShadowColor}
                  value={shadowColor}
                />
                <InputColorPicker
                  title="Border Color"
                  setState={setBorderColor}
                  value={borderColor}
                />

                <div className=" flex max-w-[256px] flex-col gap-3">
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
                  <RangeSlider
                    label="Shadow"
                    min={0}
                    max={15}
                    value={shadow}
                    onChange={handleShadowChange}
                    output
                  />
                  <RangeSlider
                    label="Padding Y"
                    value={paddingY}
                    min={5}
                    max={25}
                    onChange={handlePaddingYChange}
                    output
                  />
                  <RangeSlider
                    label="Padding X"
                    value={paddingX}
                    min={5}
                    max={25}
                    onChange={handlePaddingXChange}
                    output
                  />
                </div>
              </div>
              <div className="flex flex-col button-settings-item">
                <Layout.Section variant="oneHalf">
                  <div
                    className="px-2"
                    style={{
                      marginBottom: "15px",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    Live preview:
                  </div>
                  <Card>
                    <div>
                      <button
                        className="overflow-hidden Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--fullWidth Polaris-Button--iconWithText "
                        type="button"
                        style={{
                          backgroundColor: backgroundColor,
                          color: textColor,
                          fontWeight: 400,
                          borderWidth,
                          borderStyle: "solid",
                          borderColor: borderColor,
                          borderRadius,
                          fontSize,
                          boxShadow: `2px 2px ${shadow}px ${shadowColor}`,
                          padding: `${paddingY}px ${paddingX}px`,
                        }}
                      >
                        {/* <span className="Polaris-Button__Icon text-black">
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
                            > */}
                        {buttonText}
                        {/* </span> */}
                      </button>
                    </div>
                  </Card>
                </Layout.Section>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default ButtonDesign;

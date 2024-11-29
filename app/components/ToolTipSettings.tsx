import {
  Card,
  ColorPicker,
  hsbToHex,
  Icon,
  Layout,
  Page,
  Select,
  Text,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { SortAscendingIcon, SortDescendingIcon } from "@shopify/polaris-icons";
import CustomPopoverComponent from "./polaris-components/CustomPopoverComponent";

const ToolTipSettings = () => {
  const [selected, setSelected] = useState("enabled");

  const handleSelectChange = useCallback(
    (value: string) => setSelected(value),
    [],
  );

  const options = [
    {
      label: "sm",
      value: "14px",
      prefix: <Icon source={SortDescendingIcon} />,
    },
    {
      label: "md",
      value: "16px",
      prefix: <Icon source={SortDescendingIcon} />,
    },
    {
      label: "lg",
      value: "20px",
      prefix: <Icon source={SortDescendingIcon} />,
    },
    {
      label: "xl",
      value: "24px",
      prefix: <Icon source={SortAscendingIcon} />,
    },
  ];

  const [backgroundColor, setBackgroundColor] = useState({
    hue: 0,
    saturation: 0,
    brightness: 0,
  });
  const [fontColor, setFontColor] = useState({
    hue: 0,
    saturation: 100,
    brightness: 0,
  });
  const [priceColor, setPriceColor] = useState({
    hue: 0,
    saturation: 0,
    brightness: 10,
  });

  const [backgroundPopoverActive, setBackgroundPopoverActive] = useState(false);
  const [fontPopoverActive, setFontPopoverActive] = useState(false);
  const [pricePopoverActive, setPricePopoverActive] = useState(false);

  const toggleBackgroundPopoverActive = () =>
    setBackgroundPopoverActive((active) => !active);

  const toggleFontPopoverActive = () =>
    setFontPopoverActive((active) => !active);

  const togglePricePopoverActive = () =>
    setPricePopoverActive((active) => !active);

  const backgroundHexColor = hsbToHex(backgroundColor);
  const fontHexColor = hsbToHex(fontColor);
  const priceHexColor = hsbToHex(priceColor);

  const handleBackgroundColorChange = (newColor: any) =>
    setBackgroundColor(newColor);

  const handleFontColorChange = (newColor: any) => setFontColor(newColor);

  const handlePriceColorChange = (newColor: any) => setPriceColor(newColor);

  return (
    <Page
      primaryAction={{
        content: "Save",
        onAction: () => {
          alert("save");
        },
      }}
    >
      <Card roundedAbove="sm">
        <div className="flex ">
          <div className="w-1/3">
            <div className=" mb-3">
              <Select
                label="Font Settings"
                options={options}
                onChange={handleSelectChange}
                value={selected}
              />
            </div>

            <div className="flex flex-col gap-2">
              <CustomPopoverComponent
                label="Background color"
                popoverActive={backgroundPopoverActive}
                togglePopoverActive={toggleBackgroundPopoverActive}
                hexColor={backgroundHexColor}
                handleColorChange={handleBackgroundColorChange}
                color={backgroundColor}
              />

              <CustomPopoverComponent
                label="Font Color"
                popoverActive={fontPopoverActive}
                togglePopoverActive={toggleFontPopoverActive}
                hexColor={fontHexColor}
                handleColorChange={handleFontColorChange}
                color={fontColor}
              />

              <CustomPopoverComponent
                label="Price Color"
                popoverActive={pricePopoverActive}
                togglePopoverActive={togglePricePopoverActive}
                hexColor={priceHexColor}
                handleColorChange={handlePriceColorChange}
                color={priceColor}
              />
            </div>
          </div>
          <div className="live-preview w-1/2">
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
              <Card roundedAbove="xl">
                <div>
                  <div className="h-auto w-full">
                    <div className="wrapper  flex w-full ">
                      <div className="img w-[40%] ">
                        <img
                          className="w-full"
                          src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                          alt="Procudt"
                        />
                      </div>
                      <div className="wrapper flex flex-col gap-2 w-[60%]">
                        <div className="title flex flex-col gap-2">
                          <h1 className="font-semibold text-lg">Title</h1>
                          <p className="tracking-wider">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Ad, mollitia, consectetur ex unde numquam
                            minus illum enim
                          </p>

                          <button
                            className="overflow-hidden Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--iconWithText "
                            type="button"
                            style={
                              {
                                //   backgroundColor: bgHexColor,
                                //   color: textHexColor,
                                //   fontWeight: 400,
                                //   borderWidth,
                                //   borderStyle: "solid",
                                //   borderColor: borderHexColor,
                                //   borderRadius,
                                //   fontSize,
                                //   boxShadow: `2px 2px ${shadow}px ${shadowHexColor}`,
                                //   padding: `${paddingY}px ${paddingX}px`,
                              }
                            }
                          >
                            {"buttonText"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Layout.Section>
          </div>
        </div>
      </Card>
    </Page>
  );
};

export default ToolTipSettings;

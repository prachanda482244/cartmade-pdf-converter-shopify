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

const ToolTipSettings = ({ buttonSettings: { jsonValue } }: any) => {
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
      value: "30px",
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
        <div className="flex gap-2 ">
          <div className="w-1/3 border-0 pr-3 border-r-2">
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
              <div
                className=" p-4 rounded-lg border border-[#ccc]"
                style={{
                  backgroundColor: backgroundHexColor,
                }}
              >
                <div className="h-auto w-full">
                  <div className=" flex w-full ">
                    <div className="img w-[40%] ">
                      <img
                        className="w-full"
                        src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                        alt="Procudt"
                      />
                    </div>
                    <div className=" flex flex-col gap-2 w-[60%]">
                      <div className="title flex flex-col gap-2">
                        <h1
                          className={`font-semibold`}
                          style={{
                            fontSize: selected,
                            color: fontHexColor,
                          }}
                        >
                          Title
                        </h1>
                        <p
                          style={{
                            color: fontHexColor,
                          }}
                          className="tracking-wider"
                        >
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Ad, mollitia, consectetur ex unde numquam minus
                          illum enim
                        </p>
                        <span style={{ color: priceHexColor }}>$£2,500.00</span>

                        <div className=" flex items-center gap-2  ">
                          <button
                            className="py-1 px-2"
                            type="button"
                            style={{
                              backgroundColor: jsonValue?.backgroundColor,
                              color: jsonValue?.textColor,
                              fontWeight: 400,
                              borderWidth: jsonValue?.borderWidth,
                              borderStyle: "solid",
                              borderColor: jsonValue?.borderColor,
                              borderRadius: jsonValue?.borderRadius,
                              fontSize: jsonValue?.fontSize,
                              boxShadow: `2px 2px ${jsonValue?.shadow}px ${jsonValue?.shadowColor}`,
                              // padding: `${jsonValue?.paddingY}px ${jsonValue?.paddingX}px`,
                            }}
                          >
                            {jsonValue?.buttonText}
                          </button>
                          <button
                            style={{ color: fontHexColor }}
                            className="text-white rounded-sm shadow-md py-1 px-2 bg-transparent border border-[#ccc]"
                          >
                            View Product
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Layout.Section>
          </div>
        </div>
      </Card>
    </Page>
  );
};

export default ToolTipSettings;

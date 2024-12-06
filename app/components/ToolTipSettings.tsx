import { Button, Card, Icon, Layout, Page, Select } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { SortAscendingIcon, SortDescendingIcon } from "@shopify/polaris-icons";
import InputColorPicker from "./InputColorPicker";
import { useFetcher } from "@remix-run/react";

const ToolTipSettings = ({
  buttonSettings: { jsonValue },
  tooltipSettings: { jsonValue: tooltipJsonValue },
}: any) => {
  const fetcher = useFetcher();
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

  const [backgroundColor, setBackgroundColor] = useState(
    tooltipJsonValue?.backgroundColor || "#221aae",
  );
  const [fontColor, setFontColor] = useState(
    tooltipJsonValue?.fontColor || "#ace345",
  );
  const [priceColor, setPriceColor] = useState(
    tooltipJsonValue?.priceColor || "#544523",
  );

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("source", "TooltipSettings");
    formData.append("backgroundColor", backgroundColor);
    formData.append("priceColor", priceColor);
    formData.append("fontColor", fontColor);
    fetcher.submit(formData, { method: "post" });
  };

  if (fetcher.state === "loading") {
    shopify.toast.show("Tooltip Setting saved successfully");
  }

  // primaryAction={{
  //   content: "Save",
  //   onAction: handleSubmit,
  //   loading: fetcher.state === "submitting",
  // }}
  return (
    <Card roundedAbove="sm">
      <div className="flex gap-2 relative ">
        <div className="absolute right-0 -top-1">
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={fetcher.state === "submitting"}
          >
            Save
          </Button>
        </div>
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
            <InputColorPicker
              title="Background color"
              setState={setBackgroundColor}
              value={backgroundColor}
            />

            <InputColorPicker
              title="Font color"
              setState={setFontColor}
              value={fontColor}
            />
            <InputColorPicker
              title="Price color"
              setState={setPriceColor}
              value={priceColor}
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
                backgroundColor: backgroundColor,
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
                          color: fontColor,
                        }}
                      >
                        Title
                      </h1>
                      <p
                        style={{
                          color: fontColor,
                        }}
                        className="tracking-wider"
                      >
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Ad, mollitia, consectetur ex unde numquam minus illum
                        enim
                      </p>
                      <span style={{ color: priceColor }}>$£2,500.00</span>

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
                          style={{ color: fontColor }}
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
  );
};

export default ToolTipSettings;

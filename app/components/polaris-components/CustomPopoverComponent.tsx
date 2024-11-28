import { ColorPicker, Popover } from "@shopify/polaris";
interface CustomPopoverProps {
  label: string;
  popoverActive: boolean;
  togglePopoverActive: () => void;
  handleColorChange: (color: {
    hue: number;
    brightness: number;
    saturation: number;
  }) => void;

  color: {
    hue: number;
    brightness: number;
    saturation: number;
  };
  hexColor: string;
}

const CustomPopoverComponent: React.FC<CustomPopoverProps> = ({
  label,
  popoverActive,
  togglePopoverActive,
  handleColorChange,
  color,
  hexColor,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="min-w-[128px]">{label}</p>
      <div className="p-2 py-1 min-w-[128px] border border-[#ccc]  rounded-lg flex items-center gap-2">
        <Popover
          active={popoverActive}
          activator={
            <div
              onClick={togglePopoverActive}
              className="w-6 h-6 rounded-full cursor-pointer border border-[#ccc]"
              style={{
                backgroundColor: hexColor,
              }}
            />
          }
          onClose={togglePopoverActive}
          preferredAlignment="center"
        >
          <div className="" style={{ padding: "1rem" }}>
            <ColorPicker
              onChange={handleColorChange}
              color={color}
              allowAlpha={false}
            />
          </div>
        </Popover>
        <p>{hexColor}</p>
      </div>
    </div>
  );
};

export default CustomPopoverComponent;

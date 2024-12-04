import React from "react";

interface InputColorProps {
  title: string;
  value: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
}

const InputColorPicker: React.FC<InputColorProps> = ({
  title,
  value,
  setState,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value);
  };

  return (
    <div>
      <div className="flex items-center gap-2 py-2 px-4 border-[#ccc] ">
        <h2>{title}</h2>
        <input type="color" value={value} onChange={handleChange} />
      </div>
    </div>
  );
};

export default InputColorPicker;

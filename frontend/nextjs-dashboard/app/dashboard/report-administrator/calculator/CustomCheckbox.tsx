"use client";

import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/outline";

interface CustomCheckboxProps {
  isChecked?: boolean;
  onChange?: (value: boolean) => void;
}

const CustomCheckbox: React.FunctionComponent<CustomCheckboxProps> = ({ isChecked = false, onChange }) => {
  const handleChange = () => {
    if (onChange) {
      onChange(!isChecked); // Передача обратного значения прямо вверх
    }
  };

  return (
    <div
      className="h-full cursor-pointer flex items-center justify-center"
      onClick={handleChange}
    >
      {isChecked ? (
        <CheckCircleIcon className="h-4 text-red-500" />
      ) : (
        <CheckIcon className="h-4 text-gray-300" />
      )}
    </div>
  );
};

export default CustomCheckbox;

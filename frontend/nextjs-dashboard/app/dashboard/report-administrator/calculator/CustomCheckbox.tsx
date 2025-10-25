'use client';

import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { CheckIcon } from '@heroicons/react/24/outline';

interface CustomCheckboxProps {
  isChecked?: boolean;
  onChange?: (value: boolean) => void;
}

const CustomCheckbox: React.FunctionComponent<CustomCheckboxProps> = ({ isChecked = false, onChange }) => {
  const [checked, setChecked] = useState(isChecked);

  const handleChange = () => {
    const newValue = !checked;
    setChecked(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div
      className="w-full h-full cursor-pointer flex items-center justify-center"
      onClick={handleChange}
    >
      {checked ? (
        <CheckCircleIcon className="w-6 h-6 text-green-500" />
      ) : (
        <CheckIcon className="w-6 h-4 text-gray-300" />
      )}
    </div>
  );
};

export default CustomCheckbox;

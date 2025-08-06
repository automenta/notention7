import React from 'react';

const inputClass =
  'w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

export interface NumberInputProps {
  value: string; // The value is still a string in the input element
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder = 'Value',
  autoFocus = false,
}) => {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
      autoFocus={autoFocus}
    />
  );
};

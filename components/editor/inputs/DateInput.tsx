import React from 'react';

const inputClass =
  'w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  autoFocus = false,
}) => {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      autoFocus={autoFocus}
    />
  );
};

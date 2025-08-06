import React from 'react';

const inputClass =
  'w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

export interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  onChange,
  autoFocus = false,
}) => {
  // Format for datetime-local input, which requires 'YYYY-MM-DDTHH:mm'
  const displayValue = value.slice(0, 16);

  return (
    <input
      type="datetime-local"
      value={displayValue}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      autoFocus={autoFocus}
    />
  );
};

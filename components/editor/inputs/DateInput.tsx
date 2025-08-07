import React from 'react';

const baseInputClass =
  'p-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
const inputClass = `${baseInputClass} flex-grow rounded-l-md`;
const buttonClass = `${baseInputClass} bg-gray-600 hover:bg-gray-500 rounded-r-md`;

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
  const handleSetToday = () => {
    const today = new Date();
    // Format to YYYY-MM-DD for the date input
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    onChange(formattedDate);
  };

  return (
    <div className="flex items-center w-full">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        autoFocus={autoFocus}
        data-testid="date-input"
      />
      <button
        type="button"
        onClick={handleSetToday}
        className={buttonClass}
        aria-label="Set to today's date"
      >
        Today
      </button>
    </div>
  );
};

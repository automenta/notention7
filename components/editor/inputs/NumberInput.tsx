import React from 'react';

const baseInputClass =
    'p-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
const inputClass = `${baseInputClass} flex-grow rounded-l-md`;
const buttonClass = `${baseInputClass} bg-gray-600 hover:bg-gray-500`;

export interface NumberInputProps {
    value: string;
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
    const handleStep = (step: number) => {
        const currentValue = parseFloat(value);
        const newValue = isNaN(currentValue) ? step : currentValue + step;
        onChange(String(newValue));
    };

    return (
        <div className="flex items-center w-full">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
                autoFocus={autoFocus}
            />
            <button
                type="button"
                onClick={() => handleStep(-1)}
                className={`${buttonClass}`}
                aria-label="Decrement"
            >
                -
            </button>
            <button
                type="button"
                onClick={() => handleStep(1)}
                className={`${buttonClass} rounded-r-md`}
                aria-label="Increment"
            >
                +
            </button>
        </div>
    );
};

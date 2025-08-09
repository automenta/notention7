import React from 'react';

const inputClass =
    'w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

export interface EnumInputProps {
    value: string;
    onChange: (value: string) => void;
    options: readonly string[];
    autoFocus?: boolean;
}

export const EnumInput: React.FC<EnumInputProps> = ({
                                                        value,
                                                        onChange,
                                                        options,
                                                        autoFocus = false,
                                                    }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            autoFocus={autoFocus}
        >
            <option value="">Select...</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
};

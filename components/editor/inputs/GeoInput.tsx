import React from 'react';
import { MapPinIcon } from '../../icons';

const inputClass =
  'w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

export interface GeoInputProps {
  value: string;
  onChange: (value: string) => void;
  onOpenMap: () => void;
  autoFocus?: boolean;
}

export const GeoInput: React.FC<GeoInputProps> = ({
  value,
  onChange,
  onOpenMap,
  autoFocus = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="lat,lng"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={onOpenMap}
        className="p-2 mt-1 bg-blue-600 rounded-md hover:bg-blue-700"
        title="Select on Map"
      >
        <MapPinIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

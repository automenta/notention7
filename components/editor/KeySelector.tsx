import React, { useState } from 'react';
import type { OntologyAttribute } from '@/types';

interface KeySelectorProps {
  value: string;
  onChange: (value: string) => void;
  propertyTypes: Map<string, OntologyAttribute>;
}

import React, { useState, useEffect, useRef } from 'react';

export const KeySelector: React.FC<KeySelectorProps> = ({
  value,
  onChange,
  propertyTypes,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredKeys = Array.from(propertyTypes.keys()).filter((key) =>
    key.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev === 0 ? filteredKeys.length - 1 : prev - 1));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev === filteredKeys.length - 1 ? 0 : prev + 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (filteredKeys[selectedIndex]) {
          onChange(filteredKeys[selectedIndex]);
          setIsOpen(false);
          inputRef.current?.blur();
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredKeys, selectedIndex, onChange]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen, value]);

  useEffect(() => {
    listRef.current?.querySelector('.selected')?.scrollIntoView({
      block: 'nearest',
    });
  }, [selectedIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)} // Delay to allow click
        placeholder="Search for a property..."
        className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        autoComplete="off"
      />
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredKeys.length > 0 ? (
            filteredKeys.map((key, index) => (
              <li
                key={key}
                className={`p-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer ${
                  index === selectedIndex ? 'bg-blue-600/50 selected' : ''
                }`}
                onMouseDown={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {key}
              </li>
            ))
          ) : (
            <li className="p-2 text-sm text-gray-500">No results</li>
          )}
        </ul>
      )}
    </div>
  );
};

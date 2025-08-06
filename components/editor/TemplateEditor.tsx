import React, { useState, useEffect } from 'react';
import { Template } from '@/types';
import { Property } from '@/types';

export const TemplateEditor: React.FC<{
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSave: (properties: Property[]) => void;
}> = ({ template, isOpen, onClose, onSave }) => {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (template) {
      const initialProps = Object.entries(template.attributes).map(
        ([key, attr]) => ({
          key: key,
          operator: 'is', // Default operator
          values: attr.defaultValue ? [attr.defaultValue] : [],
        })
      );
      setProperties(initialProps);
    }
  }, [template]);

  if (!isOpen || !template) {
    return null;
  }

  const handlePropertyChange = (index: number, newProp: Property) => {
    const newProperties = [...properties];
    newProperties[index] = newProp;
    setProperties(newProperties);
  };

  const handleSave = () => {
    onSave(properties);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">{template.label}</h2>
        <p className="text-gray-400 mb-6">{template.description}</p>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          {properties.map((prop, index) => (
            <div key={index} className="bg-gray-900/50 p-4 rounded-md">
              {/* This is a placeholder for a simplified property editor view */}
              {/* In a real implementation, we would render the correct input based on type */}
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {prop.key}
              </label>
              <input
                type="text"
                value={prop.values[0] || ''}
                onChange={(e) =>
                  handlePropertyChange(index, { ...prop, values: [e.target.value] })
                }
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-colors font-semibold"
          >
            Insert Properties
          </button>
        </div>
      </div>
    </div>
  );
};

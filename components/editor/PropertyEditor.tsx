import React, { useState, useMemo, useEffect } from 'react';
import type { OntologyAttribute, Property } from '../../types';
import { StringInput } from './inputs/StringInput';
import { NumberInput } from './inputs/NumberInput';
import { DateInput } from './inputs/DateInput';
import { DateTimeInput } from './inputs/DateTimeInput';
import { EnumInput } from './inputs/EnumInput';
import { GeoInput } from './inputs/GeoInput';
import { KeySelector } from './KeySelector';

const inputClass =
  'w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
const labelClass =
  'text-xs font-bold text-gray-400 uppercase flex justify-between items-center';

export interface PropertyEditorProps {
  property?: Property;
  propertyTypes: Map<string, OntologyAttribute>;
  onSave: (property: Property) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  property,
  propertyTypes,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [key, setKey] = useState(property?.key || '');
  const [operator, setOperator] = useState(property?.operator || 'is');
  const [values, setValues] = useState<string[]>(property?.values || ['']);

  const attributeType = useMemo(
    () => propertyTypes.get(key.trim()),
    [key, propertyTypes]
  );

  // Reset operator and values if key/type changes
  useEffect(() => {
    if (attributeType) {
      const allOperators = [
        ...attributeType.operators.real,
        ...attributeType.operators.imaginary,
      ];
      if (!allOperators.includes(operator)) {
        setOperator(allOperators[0] || '');
        setValues(['']);
      }
    }
  }, [attributeType, operator]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ key, operator, values });
  };

  const handleValueChange = (index: number, newValue: string) => {
    setValues((currentValues) => {
      const newValues = [...currentValues];
      newValues[index] = newValue;
      return newValues;
    });
  };

  const renderValueInput = () => {
    const type = attributeType?.type || 'string';
    const numInputs = operator === 'between' ? 2 : 1;

    return Array.from({ length: numInputs }).map((_, index) => {
      const value = values[index] || '';

      switch (type) {
        case 'number':
          return (
            <NumberInput
              key={index}
              value={value}
              onChange={(val) => handleValueChange(index, val)}
              autoFocus={index === 0}
            />
          );
        case 'date':
          return (
            <DateInput
              key={index}
              value={value}
              onChange={(val) => handleValueChange(index, val)}
              autoFocus={index === 0}
            />
          );
        case 'datetime':
          return (
            <DateTimeInput
              key={index}
              value={value}
              onChange={(val) => handleValueChange(index, val)}
              autoFocus={index === 0}
            />
          );
        case 'enum':
          return (
            <EnumInput
              key={index}
              value={value}
              onChange={(val) => handleValueChange(index, val)}
              options={attributeType.options || []}
              autoFocus={index === 0}
            />
          );
        case 'geo':
          return (
            <GeoInput
              key={index}
              value={value}
              onChange={(val) => handleValueChange(index, val)}
              onOpenMap={() => alert('Geo map picker not implemented yet.')}
              autoFocus={index === 0}
            />
          );
        default: // string
          return (
            <StringInput
              key={index}
              value={value}
              onChange={(val) => handleValueChange(index, val)}
              autoFocus={index === 0}
            />
          );
      }
    });
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 text-white w-96 space-y-4"
    >
      <div>
        <label className={labelClass}>Key</label>
        <KeySelector
          value={key}
          onChange={setKey}
          propertyTypes={propertyTypes}
        />
      </div>

      {attributeType && (
        <div>
          <label className={labelClass}>Operator</label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className={inputClass}
          >
            {attributeType.operators.real &&
              attributeType.operators.real.length > 0 && (
                <optgroup label="Real">
                  {attributeType.operators.real.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </optgroup>
              )}
            {attributeType.operators.imaginary &&
              attributeType.operators.imaginary.length > 0 && (
                <optgroup label="Imaginary">
                  {attributeType.operators.imaginary.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </optgroup>
              )}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Value</label>
        {renderValueInput()}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete Property"
          disabled={!onDelete}
        >
          {/* Using a simple 'X' for now, will add icon later */}
          Delete
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-600 rounded-md hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

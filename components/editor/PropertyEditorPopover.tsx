import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { TrashIcon, MapPinIcon } from '../icons';
import type { OntologyAttribute } from '../../types';
import { MapPickerModal } from './MapPickerModal';

interface PropertyEditorPopoverProps {
    widgetEl: HTMLElement;
    propertyTypes: Map<string, OntologyAttribute>;
    onSave: (widgetId: string, key: string, operator: string, values: string[]) => void;
    onDelete: (widgetId: string) => void;
    onClose: () => void;
}

const inputClass = "w-full p-2 mt-1 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const labelClass = "text-xs font-bold text-gray-400 uppercase flex justify-between items-center";

export const PropertyEditorPopover: React.FC<PropertyEditorPopoverProps> = ({ widgetEl, onSave, onDelete, onClose, propertyTypes }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    
    // Initialize state from widget's data attributes
    const [key, setKey] = useState(widgetEl.dataset.key || '');
    const [operator, setOperator] = useState(widgetEl.dataset.operator || 'is');
    const [values, setValues] = useState<string[]>(() => {
        try {
            const parsed = JSON.parse(widgetEl.dataset.values || '[""]');
            return Array.isArray(parsed) ? parsed : [''];
        } catch {
            return [''];
        }
    });

    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

    const attributeType = useMemo(() => propertyTypes.get(key.trim()), [key, propertyTypes]);
    const rect = widgetEl.getBoundingClientRect();

    // Reset operator and values if key/type changes
    useEffect(() => {
        const newAttributeType = propertyTypes.get(key.trim());
        if (newAttributeType) {
            const allOperators = [...newAttributeType.operators.real, ...newAttributeType.operators.imaginary];
            if (!allOperators.includes(operator)) {
                setOperator(newAttributeType.operators.real[0] || allOperators[0]);
                setValues(['']);
            }
        }
    }, [key, operator, propertyTypes]);

    // Close popover on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && !widgetEl.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, widgetEl]);
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(widgetEl.id, key, operator, values);
    };

    const handleValueChange = (index: number, newValue: string) => {
        setValues(currentValues => {
            const newValues = [...currentValues];
            newValues[index] = newValue;
            return newValues;
        });
    };

    const renderValueInputs = () => {
        const type = attributeType?.type || 'string';
        const numInputs = operator === 'between' ? 2 : 1;

        return Array.from({ length: numInputs }).map((_, index) => {
            const value = values[index] || '';
            const placeholder = numInputs > 1 ? `Value ${index + 1}` : 'Value';
            
            switch (type) {
                case 'number':
                    return <input key={index} type="number" value={value} onChange={e => handleValueChange(index, e.target.value)} placeholder={placeholder} className={inputClass} />;
                case 'date':
                    return <input key={index} type="date" value={value} onChange={e => handleValueChange(index, e.target.value)} className={inputClass} />;
                case 'datetime':
                    const dtValue = value.slice(0, 16); // Format for datetime-local
                    return <input key={index} type="datetime-local" value={dtValue} onChange={e => handleValueChange(index, e.target.value)} className={inputClass} />;
                case 'enum':
                    return (
                        <select key={index} value={value} onChange={e => handleValueChange(index, e.target.value)} className={inputClass}>
                            <option value="">Select...</option>
                            {attributeType.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    );
                case 'geo':
                     return (
                        <div key={index} className="flex items-center gap-2">
                            <input type="text" placeholder="lat,lng" value={value} onChange={e => handleValueChange(index, e.target.value)} className={inputClass} />
                            <button type="button" onClick={() => setIsMapPickerOpen(true)} className="p-2 mt-1 bg-blue-600 rounded-md hover:bg-blue-700" title="Select on Map">
                               <MapPinIcon className="h-5 w-5"/>
                            </button>
                        </div>
                    );
                default: // string
                    return <input key={index} type="text" value={value} onChange={e => handleValueChange(index, e.target.value)} placeholder={placeholder} className={inputClass} autoFocus />;
            }
        });
    };
    
    const popoverStyle: React.CSSProperties = {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        zIndex: 50,
    };

    return ReactDOM.createPortal(
        <>
            <div ref={popoverRef} style={popoverStyle} className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 text-white w-80 animate-fade-in">
                 <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className={labelClass}>Key</label>
                        <input type="text" value={key} onChange={(e) => setKey(e.target.value)} className={inputClass} />
                     </div>
                     
                     {attributeType && (
                         <div>
                            <label className={labelClass}>Operator</label>
                            <select value={operator} onChange={e => setOperator(e.target.value)} className={inputClass}>
                                {attributeType.operators.real.length > 0 && <optgroup label="Real">{attributeType.operators.real.map(op => <option key={op} value={op}>{op}</option>)}</optgroup>}
                                {attributeType.operators.imaginary.length > 0 && <optgroup label="Imaginary">{attributeType.operators.imaginary.map(op => <option key={op} value={op}>{op}</option>)}</optgroup>}
                            </select>
                         </div>
                     )}

                     <div>
                        <label className={labelClass}>
                            <span>{operator === 'between' ? 'Values' : 'Value'}</span>
                            {attributeType?.type && <span className="font-mono text-xs lowercase px-2 py-0.5 bg-gray-600 rounded">{attributeType.type}</span>}
                        </label>
                        <div className="space-y-2">
                          {renderValueInputs()}
                        </div>
                     </div>

                     <div className="flex justify-between items-center pt-2">
                         <button type="button" onClick={() => onDelete(widgetEl.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors" title="Delete Property">
                             <TrashIcon className="h-5 w-5" />
                         </button>
                         <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 rounded-md hover:bg-blue-700">Save</button>
                         </div>
                     </div>
                </form>
            </div>
            {attributeType?.type === 'geo' && (
                <MapPickerModal
                    isOpen={isMapPickerOpen}
                    onClose={() => setIsMapPickerOpen(false)}
                    onLocationSelect={(location) => {
                        handleValueChange(0, location);
                        setIsMapPickerOpen(false);
                    }}
                    initialValue={values[0]}
                />
            )}
        </>,
        document.body
    );
}
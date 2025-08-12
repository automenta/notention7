import React, {useEffect, useRef, useState} from 'react';
import type {OntologyAttribute, OntologyNode} from '@/types';

interface KeySelectorProps {
    value: string;
    onChange: (value: string) => void;
    propertyTypes: Map<string, OntologyAttribute>;
    propertyTree: OntologyNode[];
    disabled?: boolean;
}

const KeySelectorNode: React.FC<{
    node: OntologyNode;
    level: number;
    onSelect: (key: string) => void;
    filter: string;
}> = ({node, level, onSelect, filter}) => {
    const [isOpen, setIsOpen] = useState(true);

    const hasMatchingChild = (n: OntologyNode): boolean => {
        if (n.attributes) {
            const matchingAttribute = Object.keys(n.attributes).find(attr => attr.toLowerCase().includes(filter.toLowerCase()));
            if (matchingAttribute) return true;
        }
        if (n.children) {
            return n.children.some(hasMatchingChild);
        }
        return false;
    };

    if (filter) {
        const hasDirectMatchingAttribute = node.attributes && Object.keys(node.attributes).some(attr => attr.toLowerCase().includes(filter.toLowerCase()));
        const hasChildMatch = node.children && node.children.some(hasMatchingChild);
        if (!hasDirectMatchingAttribute && !hasChildMatch && !node.label.toLowerCase().includes(filter.toLowerCase())) {
            return null;
        }
    }

    return (
        <div style={{paddingLeft: `${level * 16}px`}}>
            <div
                className="flex items-center cursor-pointer py-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                {node.children && node.children.length > 0 && (
                    <span className="w-4">{isOpen ? '▼' : '▶'}</span>
                )}
                <span className="font-semibold">{node.label}</span>
            </div>
            {isOpen && (
                <div>
                    {node.attributes &&
                        Object.keys(node.attributes)
                            .filter(attr => attr.toLowerCase().includes(filter.toLowerCase()))
                            .map((attrKey) => (
                                <div
                                    key={attrKey}
                                    className="p-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                                    style={{paddingLeft: '16px'}}
                                    onMouseDown={() => onSelect(attrKey)}
                                >
                                    {attrKey}
                                </div>
                            ))}
                    {node.children &&
                        node.children.map((child) => (
                            <KeySelectorNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                onSelect={onSelect}
                                filter={filter}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};


export const KeySelector: React.FC<KeySelectorProps> = ({
                                                            value,
                                                            onChange,
                                                            propertyTree,
                                                            disabled = false,
                                                        }) => {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelect = (key: string) => {
        onChange(key);
        setIsOpen(false);
        inputRef.current?.blur();
    };

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
                className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-800 disabled:text-gray-400"
                autoComplete="off"
                disabled={disabled}
            />
            {isOpen && (
                <div
                    className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    <div className="flex flex-col p-2">
                        {propertyTree.length > 0 ? (
                            propertyTree.map(node => (
                                <KeySelectorNode
                                    key={node.id}
                                    node={node}
                                    level={0}
                                    onSelect={handleSelect}
                                    filter={value}
                                />
                            ))
                        ) : (
                            <div className="p-2 text-sm text-gray-500">No properties found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

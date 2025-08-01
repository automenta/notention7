import React, { useState, useEffect, useRef } from 'react';
import type { OntologyNode } from '../../types';
import { PlusCircleIcon, TagIcon } from '../icons';

export interface InsertMenuItem {
    id: string;
    label: string;
    description?: string;
    template?: OntologyNode;
}

interface InsertMenuProps {
    items: InsertMenuItem[];
    query: string;
    onSelect: (item: InsertMenuItem) => void;
    onClose: () => void;
    position: { top: number, left: number };
}

export const InsertMenu: React.FC<InsertMenuProps> = ({ items, query, onSelect, onClose, position }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredItems.length]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSelectedIndex(prev => (prev === 0 ? filteredItems.length - 1 : prev - 1));
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSelectedIndex(prev => (prev === filteredItems.length - 1 ? 0 : prev + 1));
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (filteredItems[selectedIndex]) {
                    onSelect(filteredItems[selectedIndex]);
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [filteredItems, selectedIndex, onSelect, onClose]);

    useEffect(() => {
        menuRef.current?.querySelector('.selected')?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
        });
    }, [selectedIndex]);

    if (!filteredItems.length) {
        return null;
    }

    return (
        <div
            ref={menuRef}
            style={{ top: position.top, left: position.left }}
            className="fixed z-50 w-80 max-h-80 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-2 text-white animate-fade-in"
        >
            <ul role="listbox">
                {filteredItems.map((item, index) => (
                    <li
                        key={item.id}
                        role="option"
                        aria-selected={index === selectedIndex}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                            index === selectedIndex ? 'bg-blue-600/50 selected' : 'hover:bg-gray-700/70'
                        }`}
                        onClick={() => onSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <div className="flex-shrink-0 h-8 w-8 rounded-md bg-gray-700 flex items-center justify-center">
                            {item.template ? <PlusCircleIcon className="h-5 w-5 text-green-400" /> : <TagIcon className="h-5 w-5 text-blue-400" />}
                        </div>
                        <div className="overflow-hidden">
                           <p className="font-semibold truncate">{item.label}</p>
                           {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
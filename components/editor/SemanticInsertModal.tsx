
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { OntologyNode } from '../../types';
import { SearchIcon, PlusCircleIcon, TagIcon, XCircleIcon } from '../icons';

export interface InsertMenuItem {
    id: string;
    label: string;
    description?: string;
    template?: OntologyNode;
}

interface SemanticInsertModalProps {
    isOpen: boolean;
    items: InsertMenuItem[];
    onSelect: (item: InsertMenuItem) => void;
    onClose: () => void;
    title: string;
}

export const SemanticInsertModal: React.FC<SemanticInsertModalProps> = ({ isOpen, items, onSelect, onClose, title }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [query, setQuery] = useState('');
    const listRef = useRef<HTMLUListElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredItems = useMemo(() => items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) || 
        item.description?.toLowerCase().includes(query.toLowerCase())
    ), [items, query]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;
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

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredItems, selectedIndex, onSelect, onClose]);

    useEffect(() => {
        listRef.current?.querySelector('.selected')?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
        });
    }, [selectedIndex]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onMouseDown={onClose}>
            <div
                className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-lg flex flex-col"
                onMouseDown={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full bg-gray-700 border border-transparent rounded-md py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                
                <ul ref={listRef} role="listbox" className="p-2 space-y-1 overflow-y-auto" style={{maxHeight: '60vh'}}>
                    {filteredItems.length > 0 ? filteredItems.map((item, index) => (
                        <li
                            key={item.id}
                            role="option"
                            aria-selected={index === selectedIndex}
                            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer ${
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
                               {item.description && <p className="text-sm text-gray-400 truncate">{item.description}</p>}
                            </div>
                        </li>
                    )) : (
                        <li className="text-center p-8 text-gray-500">No results found.</li>
                    )}
                </ul>

                <div className="p-2 border-t border-gray-700 flex-shrink-0 text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 rounded-md hover:bg-gray-500">Close</button>
                </div>
            </div>
        </div>
    );
};

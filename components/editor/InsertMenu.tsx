import React, {useEffect, useMemo, useRef, useState} from 'react';
import {InsertMenuItem} from '@/hooks/useInsertMenuItems';
import {DocumentDuplicateIcon, ListUlIcon, TagIcon} from '../icons';

const TypeIcon = ({type}: { type: InsertMenuItem['type'] }) => {
    switch (type) {
        case 'tag':
            return <TagIcon className="h-5 w-5 text-sky-400"/>;
        case 'template':
            return <DocumentDuplicateIcon className="h-5 w-5 text-purple-400"/>;
        case 'property':
            return <ListUlIcon className="h-5 w-5 text-amber-400"/>;
        default:
            return null;
    }
};

export const InsertMenu: React.FC<{
    items: InsertMenuItem[];
    onSelect: (item: InsertMenuItem) => void;
}> = ({items, onSelect}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter((item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [items, searchTerm]);

    // Reset index when search term or items change
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchTerm, items]);

    // Keyboard navigation handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredItems.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(
                    (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
                );
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    onSelect(filteredItems[selectedIndex]);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [filteredItems, selectedIndex, onSelect]);

    // Scroll active item into view
    useEffect(() => {
        const selectedItem = listRef.current?.children[selectedIndex] as HTMLElement;
        if (selectedItem) {
            selectedItem.scrollIntoView({
                block: 'nearest',
            });
        }
    }, [selectedIndex, filteredItems]);

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-80 text-sm">
            <div className="p-2">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
            </div>
            <div ref={listRef} className="max-h-80 overflow-y-auto">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            data-testid={`insert-menu-item-${item.id}`}
                            onClick={() => onSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md mx-1 ${
                                index === selectedIndex
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'hover:bg-gray-700/50'
                            }`}
                        >
                            <TypeIcon type={item.type}/>
                            <div className="flex-grow">
                                <p className="font-medium text-gray-200">{item.label}</p>
                                <p className="text-gray-400">{item.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-gray-400">No results found.</p>
                )}
            </div>
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import { InsertMenuItem } from '@/hooks/useInsertMenuItems';
import { TagIcon, DocumentDuplicateIcon, ListUlIcon } from '../icons';

const TypeIcon = ({ type }: { type: InsertMenuItem['type'] }) => {
  switch (type) {
    case 'tag':
      return <TagIcon className="h-5 w-5 text-sky-400" />;
    case 'template':
      return <DocumentDuplicateIcon className="h-5 w-5 text-purple-400" />;
    case 'property':
      return <ListUlIcon className="h-5 w-5 text-amber-400" />;
    default:
      return null;
  }
};

export const InsertMenu: React.FC<{
  items: InsertMenuItem[];
  onSelect: (item: InsertMenuItem) => void;
}> = ({ items, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // TODO: Add keyboard navigation (arrow keys, enter, escape)

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
      <div className="max-h-80 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700/50`}
            >
              <TypeIcon type={item.type} />
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

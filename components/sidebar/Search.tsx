import React from 'react';
import {SearchIcon, XCircleIcon} from '../icons';

interface SearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const Search: React.FC<SearchProps> = ({searchTerm, setSearchTerm}) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400"/>
            </div>
            <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-transparent rounded-md py-2 pl-10 pr-10 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                        onClick={() => setSearchTerm('')}
                        className="text-gray-500 hover:text-white"
                        title="Clear search"
                    >
                        <XCircleIcon className="h-5 w-5"/>
                    </button>
                </div>
            )}
        </div>
    );
};

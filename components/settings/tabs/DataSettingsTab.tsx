import React from 'react';
import { TrashIcon } from '../../icons';

export const DataSettingsTab: React.FC = () => {
  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all data? This action cannot be undone.'
      )
    ) {
      window.localStorage.clear();
      window.indexedDB.deleteDatabase('localforage');
      window.location.reload();
    }
  };

  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
        <TrashIcon className="h-6 w-6 text-red-400" />
        Data Management
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Your notes and settings are stored locally in your browser&apos;s
        IndexedDB. Clearing data is irreversible.
      </p>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 flex items-center gap-2"
        onClick={handleClearData}
      >
        <TrashIcon className="h-5 w-5" /> Clear All Local Data
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import type { AppSettings, Note } from '@/types';
import { useEditors } from './editor/editors';
import { WorldIcon } from './icons';
import { nostrService } from '../services/NostrService';
import { useNotification } from './contexts/NotificationContext';

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
  settings: AppSettings;
}

export const EditorManager: React.FC<EditorManagerProps> = ({
  note,
  onSave,
  onDelete,
  settings,
}) => {
  const { editors, getEditor } = useEditors();
  const { addNotification } = useNotification();
  const [selectedEditorId, setSelectedEditorId] = useState<string>('rich-text'); // Default to Rich Text editor
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!settings.nostr.privkey) {
      addNotification('Nostr private key not set in settings.');
      return;
    }
    setIsPublishing(true);
    try {
      await nostrService.publishNote(note, settings.nostr.privkey);
      addNotification('Note published successfully!');
    } catch (error) {
      console.error('Failed to publish note:', error);
      addNotification(`Failed to publish note. See console for details.`);
    } finally {
      setIsPublishing(false);
    }
  };

  const SelectedEditorComponent = getEditor(selectedEditorId)?.component;

  if (!SelectedEditorComponent) {
    return (
      <div className="text-red-500">Error: Selected editor not found.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-2 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Editor:</span>
          <select
            className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEditorId}
            onChange={(e) => setSelectedEditorId(e.target.value)}
          >
            {editors.map((plugin) => (
              <option key={plugin.id} value={plugin.id}>
                {plugin.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handlePublish}
          disabled={isPublishing || !settings.nostr.privkey}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          title={
            settings.nostr.privkey
              ? 'Publish to Nostr'
              : 'Nostr private key not set in settings'
          }
        >
          <WorldIcon className="h-4 w-4" />
          {isPublishing ? 'Publishing...' : 'Publish'}
        </button>
      </div>
      <div className="flex-1">
        <SelectedEditorComponent
          note={note}
          onSave={onSave}
          onDelete={onDelete}
          settings={settings}
        />
      </div>
    </div>
  );
};

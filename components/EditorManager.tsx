import React, {useState} from 'react';
import {AppSettings, Note} from '../types';
import {EditorPlugin} from '../types/editor';
import {TiptapEditor} from './TiptapEditor';
import {TextareaEditor} from './TextareaEditor';

interface EditorManagerProps {
    note: Note;
    onSave: (note: Note) => void;
    onDelete: (id: string) => void;
    settings: AppSettings;
}

export const EditorManager: React.FC<EditorManagerProps> = ({note, onSave, onDelete, settings}) => {
    const editorPlugins: EditorPlugin[] = [
        {
            id: 'tiptap',
            name: 'Rich Text Editor',
            component: TiptapEditor,
        },
        {
            id: 'textarea',
            name: 'Plain Text Editor',
            component: TextareaEditor,
        },
    ];

    const [selectedEditorId, setSelectedEditorId] = useState<string>('tiptap'); // Default to Tiptap editor

    const SelectedEditorComponent = editorPlugins.find(plugin => plugin.id === selectedEditorId)?.component;

    if (!SelectedEditorComponent) {
        return <div className="text-red-500">Error: Selected editor not found.</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 p-2 border-b border-gray-700/50 flex items-center justify-between">
                <span className="text-sm text-gray-400">Editor Type:</span>
                <select
                    className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedEditorId}
                    onChange={(e) => setSelectedEditorId(e.target.value)}
                >
                    {editorPlugins.map(plugin => (
                        <option key={plugin.id} value={plugin.id}>{plugin.name}</option>
                    ))}
                </select>
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

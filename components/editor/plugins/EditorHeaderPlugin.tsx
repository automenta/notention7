import React from 'react';
import { EditorApi, EditorPlugin } from '@/types/editor.ts';
import { CubeIcon, TrashIcon } from '../../icons';

export const EditorHeaderComponent: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  const note = editorApi.getNote();
  const title = note.title;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editorApi.updateNote({ title: e.target.value });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      editorApi.deleteNote();
    }
  };

  return (
    <div className="flex-shrink-0 flex flex-col p-4 border-b border-gray-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CubeIcon className="h-6 w-6 text-gray-300" />
          <span className="text-sm text-gray-400">Note</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Placeholder for Publish and Summarize buttons */}
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md"
            title="Delete note"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note Title"
        className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-500 focus:outline-none pt-4 pb-0"
      />
    </div>
  );
};

export const editorHeaderPlugin: EditorPlugin = {
  id: 'editor-header',
  name: 'Editor Header',
  HeaderComponent: EditorHeaderComponent,
};

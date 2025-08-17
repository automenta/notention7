import React, { useState, useEffect } from 'react';
import type { EditorApi, AIAction } from '@/types';
import { useNotesContext } from '../../contexts/NotesContext';
import { useAppContext } from '../../contexts/AppContext';
import { useAIActionGenerator } from '@/hooks/useAIActionGenerator';
import {
  ClipboardIcon,
  DocumentDuplicateIcon,
  LoadingSpinner,
  PlusCircleIcon,
  XCircleIcon,
} from '../../icons';
import {
  AI_ACTIONS,
  COPIED_BUTTON_TEXT,
  COPY_BUTTON_TEXT,
} from './AIActionConstants';

interface AIActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: AIAction | null;
  editorApi: EditorApi;
}

export const AIActionModal: React.FC<AIActionModalProps> = ({
  isOpen,
  onClose,
  action,
  editorApi,
}) => {
  const { generationState, generatedContent, error, reset } =
    useAIActionGenerator(action, editorApi, isOpen);
  const [copyButtonText, setCopyButtonText] = useState(COPY_BUTTON_TEXT);
  const { addNote } = useNotesContext();
  const { setActiveView, setSelectedNoteId } = useAppContext();

  useEffect(() => {
    if (isOpen) {
      setCopyButtonText(COPY_BUTTON_TEXT);
    }
  }, [isOpen]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopyButtonText(COPIED_BUTTON_TEXT);
    setTimeout(() => setCopyButtonText(COPY_BUTTON_TEXT), 2000);
  };

  const handleAppend = () => {
    const currentContent = editorApi.getNote().content;
    const newContent = `${currentContent}<hr><p>${generatedContent.replace(
      /\n/g,
      '<br>'
    )}</p>`;
    editorApi.updateNote({ content: newContent });

    setTimeout(() => {
      if (editorApi.editorRef.current) {
        editorApi.editorRef.current.scrollTop =
          editorApi.editorRef.current.scrollHeight;
      }
    }, 100);

    handleClose();
  };

  const handleCreateNew = () => {
    const actionLabel = AI_ACTIONS.find((a) => a.id === action)?.label || 'AI Result';
    const newNote = addNote({
      title: `${actionLabel} of "${editorApi.getNote().title}"`,
      content: `<p>${generatedContent.replace(/\n/g, '<br>')}</p>`,
    });
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
    handleClose();
  };

  if (!isOpen) return null;

  const actionLabel =
    AI_ACTIONS.find((a) => a.id === action)?.label || 'AI Action';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="flex flex-col w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl min-h-[300px]">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{actionLabel}</h2>
          <button onClick={handleClose}>
            <XCircleIcon className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          {generationState === 'streaming' && !generatedContent && (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner className="w-8 h-8" />
              <span className="ml-4 text-gray-400">Generating...</span>
            </div>
          )}
          {generationState === 'error' && (
            <div className="p-4 rounded text-red-400 bg-red-900/50">
              <h3 className="mb-2 font-bold">Error</h3>
              <p>{error}</p>
            </div>
          )}
          {(generationState === 'streaming' || generationState === 'done') && (
            <div
              className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-gray-300"
            >
              {generatedContent}
              {generationState === 'streaming' && (
                <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse" />
              )}
            </div>
          )}
        </main>

        {generationState === 'done' && (
          <footer className="flex justify-end gap-3 p-4 border-t border-gray-700 bg-gray-900/50">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-500"
            >
              <ClipboardIcon className="w-4 h-4" /> {copyButtonText}
            </button>
            <button
              onClick={handleAppend}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <DocumentDuplicateIcon className="w-4 h-4" /> Append to Note
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              <PlusCircleIcon className="w-4 h-4" /> Create New Note
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

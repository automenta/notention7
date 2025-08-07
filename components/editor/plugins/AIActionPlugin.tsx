import React, { useState, useEffect, useRef } from 'react';
import type { EditorApi } from '../../../types';
import {
  generateContentStream,
  AIAction,
} from '../../../services/languageModelService';
import {
  SparklesIcon,
  ChevronDownIcon,
  XCircleIcon,
  LoadingSpinner,
  ClipboardIcon,
  DocumentDuplicateIcon,
  PlusCircleIcon,
} from '../../icons';
import { getTextFromHtml } from '../../../utils/nostr';
import { useNotesContext } from '../../contexts/NotesContext';
import { useViewContext } from '../../contexts/ViewContext';

type GenerationState = 'idle' | 'streaming' | 'done' | 'error';

const AI_ACTIONS: { id: AIAction; label: string }[] = [
  { id: 'summarize', label: 'Summarize' },
  { id: 'key-points', label: 'Extract Key Points' },
  { id: 'questions', label: 'Generate Questions' },
  { id: 'action-items', label: 'Find Action Items' },
];

// --- Modal Component ---

const AIActionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  action: AIAction | null;
  editorApi: EditorApi;
}> = ({ isOpen, onClose, action, editorApi }) => {
  const [generationState, setGenerationState] =
    useState<GenerationState>('idle');
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const { addNote } = useNotesContext();
  const { setActiveView, setSelectedNoteId } = useViewContext();

  useEffect(() => {
    if (!isOpen || !action) return;

    const generate = async () => {
      setGenerationState('streaming');
      setGeneratedContent('');
      setError(null);

      const note = editorApi.getNote();
      const settings = editorApi.getSettings();
      const apiKey = settings.geminiApiKey;
      const textToProcess = getTextFromHtml(note.content);

      if (!apiKey) {
        setError('Gemini API key is not set.');
        setGenerationState('error');
        return;
      }
      if (!textToProcess.trim()) {
        setError('Note content is empty.');
        setGenerationState('error');
        return;
      }

      try {
        const stream = generateContentStream(apiKey, action, textToProcess);
        for await (const chunk of stream) {
          setGeneratedContent((prev) => prev + chunk);
        }
        setGenerationState('done');
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        setGenerationState('error');
        console.error(e);
      }
    };

    generate();
  }, [isOpen, action, editorApi]);

  const handleClose = () => {
    setGeneratedContent('');
    setError(null);
    setGenerationState('idle');
    setCopyButtonText('Copy');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy'), 2000);
  };

  const handleAppend = () => {
    const currentContent = editorApi.getNote().content;
    const newContent = `${currentContent}<hr><p>${generatedContent.replace(
      /\n/g,
      '<br>'
    )}</p>`;
    editorApi.updateNote({ content: newContent });

    // Scroll to bottom
    setTimeout(() => {
      if (editorApi.editorRef.current) {
        editorApi.editorRef.current.scrollTop =
          editorApi.editorRef.current.scrollHeight;
      }
    }, 100);

    handleClose();
  };

  const handleCreateNew = () => {
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
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col"
        style={{ minHeight: '300px' }}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{actionLabel}</h2>
          <button onClick={handleClose}>
            <XCircleIcon className="h-6 w-6 text-gray-400 hover:text-white" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          {generationState === 'streaming' && !generatedContent && (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner className="h-8 w-8" />
              <span className="ml-4 text-gray-400">Generating...</span>
            </div>
          )}
          {generationState === 'error' && (
            <div className="text-red-400 bg-red-900/50 p-4 rounded">
              <h3 className="font-bold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          )}
          {(generationState === 'streaming' || generationState === 'done') && (
            <div
              className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap"
              style={{ color: '#d1d5db' }}
            >
              {generatedContent}
              {generationState === 'streaming' && (
                <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1" />
              )}
            </div>
          )}
        </main>

        {generationState === 'done' && (
          <footer className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors rounded-lg bg-gray-600 text-white hover:bg-gray-500"
            >
              <ClipboardIcon className="h-4 w-4" /> {copyButtonText}
            </button>
            <button
              onClick={handleAppend}
              className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <DocumentDuplicateIcon className="h-4 w-4" /> Append to Note
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              <PlusCircleIcon className="h-4 w-4" /> Create New Note
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

// --- Header Button Component ---

export const AIActionComponent: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<AIAction | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const settings = editorApi.getSettings();
    setIsApiKeySet(!!settings.geminiApiKey);
  }, [editorApi]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActionClick = (actionId: AIAction) => {
    setIsMenuOpen(false);
    setCurrentAction(actionId);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative flex items-center gap-2 mr-4" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          disabled={!isApiKeySet}
          title={
            isApiKeySet ? 'AI Actions' : 'Gemini API key not set in settings'
          }
          className="flex items-center gap-2 px-3 py-1.5 transition-colors rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="h-5 w-5" />
          <span>AI Actions</span>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
            <ul className="py-1">
              {AI_ACTIONS.map((action) => (
                <li key={action.id}>
                  <button
                    onClick={() => handleActionClick(action.id)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                  >
                    {action.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AIActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        action={currentAction}
        editorApi={editorApi}
      />
    </>
  );
};

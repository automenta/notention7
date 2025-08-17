import React, { useState, useEffect, useRef } from 'react';
import type { EditorApi, AIAction } from '@/types';
import { ChevronDownIcon, SparklesIcon } from '../../icons';
import { AI_ACTIONS } from './AIActionConstants';
import { AIActionModal } from './AIActionModal';

interface AIActionMenuProps {
  editorApi: EditorApi;
}

export const AIActionMenu: React.FC<AIActionMenuProps> = ({ editorApi }) => {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAction(null);
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
          className="flex items-center gap-2 px-3 py-1.5 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="w-5 h-5" />
          <span>AI Actions</span>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isMenuOpen && (
          <div className="absolute top-full right-0 z-50 w-56 mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
            <ul className="py-1">
              {AI_ACTIONS.map((action) => (
                <li key={action.id}>
                  <button
                    onClick={() => handleActionClick(action.id)}
                    className="w-full px-4 py-2 text-sm text-left text-gray-200 hover:bg-gray-600"
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
        onClose={handleCloseModal}
        action={currentAction}
        editorApi={editorApi}
      />
    </>
  );
};

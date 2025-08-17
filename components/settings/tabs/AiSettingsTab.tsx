import React from 'react';
import { SparklesIcon } from '../../icons';
import type { AppSettings } from '../../../types';

interface AiSettingsTabProps {
  settings: AppSettings;
  apiKeyInput: string;
  setApiKeyInput: (value: string) => void;
  handleSaveApiKey: () => void;
  handleToggleAI: () => void;
}

export const AiSettingsTab: React.FC<AiSettingsTabProps> = ({
  settings,
  apiKeyInput,
  setApiKeyInput,
  handleSaveApiKey,
  handleToggleAI,
}) => {
  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
        <SparklesIcon className="h-6 w-6 text-blue-400" />
        AI Enhancements
      </h2>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="gemini-api-key"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Google Gemini API Key
          </label>
          <div className="flex items-center gap-2">
            <input
              id="gemini-api-key"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="flex-grow p-2 bg-gray-800 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div className="border-t border-gray-700/50 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <label
                htmlFor="ai-toggle"
                className={`font-medium ${
                  settings.geminiApiKey ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Enable AI Features
              </label>
              <p
                className={`text-sm mt-1 ${
                  settings.geminiApiKey ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Enables features like note summarization and semantic
                suggestions.
              </p>
            </div>
            <div
              className="relative"
              title={
                !settings.geminiApiKey
                  ? 'You must save a valid Gemini API key to enable this feature.'
                  : ''
              }
            >
              <button
                id="ai-toggle"
                onClick={handleToggleAI}
                disabled={!settings.geminiApiKey}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
                  settings.geminiApiKey
                    ? settings.aiEnabled
                      ? 'bg-blue-600'
                      : 'bg-gray-600'
                    : 'bg-gray-700 cursor-not-allowed'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
                    settings.aiEnabled && settings.geminiApiKey
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {!settings.geminiApiKey && (
        <div className="mt-6 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-sm rounded-md">
          <strong>Action Required:</strong> A Google Gemini API key has not
          been set. AI features are disabled. Please enter your key above to
          proceed.
        </div>
      )}
    </div>
  );
};

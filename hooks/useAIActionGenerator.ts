import { useState, useEffect, useCallback } from 'react';
import type { EditorApi } from '@/types';
import {
  AIAction,
  generateContentStream,
} from '@/services/languageModelService';
import { getTextFromHtml } from '@/utils/dom';

type GenerationState = 'idle' | 'streaming' | 'done' | 'error';

export const useAIActionGenerator = (
  action: AIAction | null,
  editorApi: EditorApi,
  isOpen: boolean
) => {
  const [generationState, setGenerationState] =
    useState<GenerationState>('idle');
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setGenerationState('idle');
    setGeneratedContent('');
    setError(null);
  }, []);

  useEffect(() => {
    if (!isOpen || !action) {
      return;
    }

    const generate = async () => {
      reset();
      setGenerationState('streaming');

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
  }, [isOpen, action, editorApi, reset]);

  return { generationState, generatedContent, error, reset };
};

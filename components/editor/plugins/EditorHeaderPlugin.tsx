import React, { useState } from 'react';
import type { AISuggestions, EditorApi } from '../../../types';
import { CubeIcon, SparklesIcon, TagIcon, TrashIcon } from '../../icons';
import {
  generateContentStream,
  suggestTagsAndProperties,
} from '../../../services/languageModelService';
import { SummaryModal } from '../SummaryModal';
import { getCleanText } from '../../../utils/editor';
import { SemanticsModal } from '../SemanticsModal';

export const EditorHeaderComponent: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  const note = editorApi.getNote();
  const settings = editorApi.getSettings();
  const title = note.title;

  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [isSemanticsModalOpen, setSemanticsModalOpen] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] =
    useState<AISuggestions>({ tags: [], properties: [] });
  const [isSuggesting, setIsSuggesting] = useState(false);

  const canUseAI = settings.aiEnabled && !!settings.geminiApiKey;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editorApi.updateNote({ title: e.target.value });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      editorApi.deleteNote();
    }
  };

  const handleSummarize = async () => {
    if (!canUseAI) return;

    setSummaryModalOpen(true);
    setIsGenerating(true);
    setGeneratedSummary(''); // Clear previous summary

    try {
      const cleanText = getCleanText(note.content);
      const stream = generateContentStream(
        settings.geminiApiKey!,
        'summarize',
        cleanText
      );

      for await (const chunk of stream) {
        setGeneratedSummary((prev) => prev + chunk);
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      setGeneratedSummary(`Failed to generate summary: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertSummary = (summary: string) => {
    const summaryHtml = `<p><strong>Summary:</strong></p><p>${summary}</p><hr>`;
    editorApi.insertHtml(summaryHtml);
    setSummaryModalOpen(false);
  };

  const handleSuggest = async () => {
    if (!canUseAI) return;

    setSemanticsModalOpen(true);
    setIsSuggesting(true);

    try {
      const cleanText = getCleanText(note.content);
      const suggestions = await suggestTagsAndProperties(
        settings.geminiApiKey!,
        cleanText,
        settings.ontology
      );
      setGeneratedSuggestions(suggestions);
    } catch (error) {
      console.error(error);
      // You could display this error in the modal
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplySuggestions = (suggestions: AISuggestions) => {
    let htmlToInsert = '';
    suggestions.tags.forEach((tag) => {
      htmlToInsert += ` <span class="widget tag" contenteditable="false" data-tag="${tag}">#${tag}</span> `;
    });
    // Note: This is a simplified property insertion. A robust solution
    // would need to consider the ontology to create typed widgets.
    suggestions.properties.forEach((prop) => {
      const operator = 'is'; // Defaulting to 'is'
      const values = [prop.value];
      const propertyHtml = `<span class="widget property" contenteditable="false" data-key="${prop.key}" data-operator="${operator}" data-values='${JSON.stringify(values)}'>[${prop.key}:${operator}:${prop.value}]</span>`;
      htmlToInsert += ` ${propertyHtml} `;
    });

    if (htmlToInsert) {
      editorApi.insertHtml(htmlToInsert);
    }
    setSemanticsModalOpen(false);
  };

  return (
    <>
      <div className="flex-shrink-0 flex flex-col p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CubeIcon className="h-6 w-6 text-gray-300" />
            <span className="text-sm text-gray-400">Note</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSummarize}
              disabled={!canUseAI || isGenerating || isSuggesting}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-300 text-sm font-semibold rounded-md hover:bg-blue-600/40 disabled:bg-gray-600/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              title={
                canUseAI
                  ? 'Summarize note content'
                  : 'AI features disabled or API key not set'
              }
            >
              <SparklesIcon className="h-4 w-4" />
              Summarize
            </button>
            <button
              onClick={handleSuggest}
              disabled={!canUseAI || isGenerating || isSuggesting}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600/20 text-purple-300 text-sm font-semibold rounded-md hover:bg-purple-600/40 disabled:bg-gray-600/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              title={
                canUseAI
                  ? 'Suggest tags & properties'
                  : 'AI features disabled or API key not set'
              }
            >
              <TagIcon className="h-4 w-4" />
              Suggest
            </button>
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
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={generatedSummary}
        onInsert={handleInsertSummary}
        isGenerating={isGenerating}
      />
      <SemanticsModal
        isOpen={isSemanticsModalOpen}
        onClose={() => setSemanticsModalOpen(false)}
        suggestions={generatedSuggestions}
        onApply={handleApplySuggestions}
        isGenerating={isSuggesting}
      />
    </>
  );
};


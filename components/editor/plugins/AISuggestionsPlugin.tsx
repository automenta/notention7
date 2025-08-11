import React, { useState } from 'react';
import { SparklesIcon } from '../../icons';
import { useNotification } from '../../contexts/notification.context';
import { suggestTagsAndProperties } from '../../../services/languageModelService';
import type { EditorApi, TagWidgetNode, PropertyWidgetNode, TextNode } from '@/types';

// eslint-disable-next-line react-refresh/only-export-components
const AISuggestionsHeader: React.FC<{ editorApi: EditorApi }> = ({ editorApi }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotification();
  const settings = editorApi.getSettings();
  const { aiEnabled, geminiApiKey } = settings;

  const handleSuggest = async () => {
    if (!geminiApiKey) {
      addNotification('Gemini API key is not set.');
      return;
    }
    setIsLoading(true);
    try {
      const model = editorApi.getContentModel();
      const content = model.map(n => (n.type === 'text' ? n.content : '')).join(' ');

      const suggestions = await suggestTagsAndProperties(
        geminiApiKey,
        content,
        settings.ontology
      );

      const tagNodes: TagWidgetNode[] = suggestions.tags.map((tag) => ({
        type: 'widget',
        kind: 'tag',
        id: `widget-${Date.now()}-${Math.random()}`,
        tag: tag,
      }));

      const propertyNodes: PropertyWidgetNode[] = suggestions.properties.map((prop) => ({
        type: 'widget',
        kind: 'property',
        id: `widget-${Date.now()}-${Math.random()}`,
        key: prop.key,
        operator: 'is', // Default operator
        values: [prop.value],
      }));

      const nodesToInsert = [...tagNodes, ...propertyNodes].reduce((acc, node) => {
        acc.push(node, { type: 'text', content: '\u00A0' }); // Add space after each
        return acc;
      }, [] as (TagWidgetNode | PropertyWidgetNode | TextNode)[]);

      if (nodesToInsert.length > 0) {
        editorApi.insertNodes(nodesToInsert);
        addNotification(`Added ${suggestions.tags.length} tags and ${suggestions.properties.length} properties.`);
      } else {
        addNotification('No new suggestions found.');
      }

    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      addNotification('Failed to get AI suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!aiEnabled) {
    return null;
  }

  return (
    <div className="p-2 border-b border-gray-700/50 flex justify-end">
      <button
        onClick={handleSuggest}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-wait transition-colors"
        title="Use AI to suggest tags and properties based on note content"
      >
        <SparklesIcon className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
        {isLoading ? 'Thinking...' : 'AI Suggestions'}
      </button>
    </div>
  );
};

export const AISuggestionsPlugin = {
  id: 'ai-suggestions',
  HeaderComponent: AISuggestionsHeader,
};

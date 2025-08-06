import React, { useMemo } from 'react';
import { EditorApi, EditorPlugin } from '@/types/editor.ts';
import {
  DocumentDuplicateIcon,
  PlusIcon,
  TagIcon,
} from '../../icons';
import { useOntologyIndex } from '@/hooks/useOntologyIndex.ts';

const buttonClass = `p-2 rounded-md transition-colors hover:bg-gray-700/80 text-gray-400 hover:text-gray-200`;

export const SemanticInsertToolbar: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  const handleInsertClick = () => {
    editorApi.plugins['insert-menu'].open();
  };

  return (
    <>
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      <button
        onClick={handleInsertClick}
        className={buttonClass}
        title="Insert semantic content"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </>
  );
};

export const semanticInsertPlugin: EditorPlugin = {
  id: 'semantic-insert',
  name: 'Semantic Insert',
  ToolbarComponent: SemanticInsertToolbar,
};

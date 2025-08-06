import React, { useMemo } from 'react';
import { EditorApi, EditorPlugin } from '@/types/editor.ts';
import { DocumentDuplicateIcon, TagIcon } from '../../icons';
import { useOntologyIndex } from '@/hooks/useOntologyIndex.ts';
import { InsertMenu } from '../InsertMenu.tsx';
import { InsertMenuItem } from '@/hooks/useInsertMenuItems.ts';

const buttonClass = `p-2 rounded-md transition-colors hover:bg-gray-700/80 text-gray-400 hover:text-gray-200`;

export const SemanticInsertToolbar: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  return (
    <>
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      <button
        onClick={() => (editorApi as any).openSemanticInsertModal('tag')}
        className={buttonClass}
        title="Insert Tag"
      >
        <TagIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => (editorApi as any).openSemanticInsertModal('template')}
        className={buttonClass}
        title="Insert Template"
      >
        <DocumentDuplicateIcon className="h-5 w-5" />
      </button>
    </>
  );
};

export const SemanticInsertModalProvider: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  const { allTags, allTemplates } = useOntologyIndex(
    editorApi.getSettings().ontology
  );
  const state = (editorApi as any).getSemanticModalState();

  const items: InsertMenuItem[] = useMemo(() => {
    if (state.type === 'tag') {
      return allTags.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        type: 'tag',
        action: () => {
          const html = `<span class="widget tag" contenteditable="false" data-tag="${t.label}">#${t.label}</span>&nbsp;`;
          editorApi.insertHtml(html);
        },
      }));
    }
    if (state.type === 'template') {
      return allTemplates.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        type: 'template',
        action: () => {
          const propertiesHtml = Object.keys(t.attributes)
            .map((key) => {
              const id = `widget-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 9)}`;
              return `<span id="${id}" class="widget property" contenteditable="false" data-key="${key}" data-operator="is" data-value="">[${key}:is:]</span>`;
            })
            .join('&nbsp;');
          const html = `<div>${propertiesHtml}</div>`;
          editorApi.insertHtml(html, () => {});
        },
      }));
    }
    return [];
  }, [state.type, allTags, allTemplates, editorApi]);

  if (!state.open) {
    return null;
  }

  const handleSelect = (item: InsertMenuItem) => {
    item.action();
    (editorApi as any).closeSemanticInsertModal();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white text-center mb-4">
          Insert {state.type === 'tag' ? 'Tag' : 'Template'}
        </h2>
        <InsertMenu items={items} onSelect={handleSelect} />
      </div>
    </div>
  );
};


export const semanticInsertPlugin: EditorPlugin = {
  id: 'semantic-insert',
  name: 'Semantic Insert',
  ToolbarComponent: SemanticInsertToolbar,
  Modal: SemanticInsertModalProvider,
};

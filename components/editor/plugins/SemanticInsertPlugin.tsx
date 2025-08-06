import React, { useMemo } from 'react';
import { EditorApi } from '../../../types/editor';
import { TagIcon, DocumentDuplicateIcon } from '../../icons';
import {
  SemanticInsertModal,
  InsertMenuItem,
} from '../../editor/SemanticInsertModal';
import { useOntologyIndex } from '../../../hooks/useOntologyIndex';

const buttonClass = `p-2 rounded-md transition-colors hover:bg-gray-700/80 text-gray-400 hover:text-gray-200`;

export const SemanticInsertToolbar: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  return (
    <>
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      <button
        onClick={() => editorApi.openSemanticInsertModal('tag')}
        className={buttonClass}
        title="Insert Tag"
      >
        <TagIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editorApi.openSemanticInsertModal('template')}
        className={buttonClass}
        title="Insert Template"
      >
        <DocumentDuplicateIcon className="h-5 w-5" />
      </button>
    </>
  );
};

export const SemanticInsertModalProvider: React.FC<{
  editorApi: EditorApi;
}> = ({ editorApi }) => {
  const settings = editorApi.getSettings();
  const { allTags, allTemplates } = useOntologyIndex(settings.ontology);
  const modalState = editorApi.getSemanticModalState();

  const insertModalItems = useMemo(() => {
    if (modalState.type === 'tag') {
      return allTags.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
      }));
    }
    if (modalState.type === 'template') {
      return allTemplates.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        template: t,
      }));
    }
    return [];
  }, [modalState.type, allTags, allTemplates]);

  const handleSelect = (item: InsertMenuItem) => {
    let htmlToInsert = '';
    if (modalState.type === 'tag') {
      htmlToInsert = `<span class="widget tag" contenteditable="false" data-tag="${item.label}">#${item.label}</span>&nbsp;`;
    } else if (modalState.type === 'template') {
      const template = item.template;
      if (template && template.attributes) {
        htmlToInsert =
          Object.keys(template.attributes)
            .map((key) => {
              const k = key.trim();
              const v = [''];
              const op = 'is';
              // Note: We're losing the auto-focus-on-first-widget functionality for now.
              // This can be re-added later with a more advanced EditorApi.
              return `<span class="widget property" contenteditable="false" data-key="${k}" data-operator="${op}" data-values='${JSON.stringify(v)}'>[${k}:is:""]</span>`;
            })
            .join(' ') + '&nbsp;';
      }
    }

    if (htmlToInsert) {
      editorApi.insertHtml(htmlToInsert);
    }
    editorApi.closeSemanticInsertModal();
  };

  return (
    <SemanticInsertModal
      isOpen={modalState.open}
      onClose={editorApi.closeSemanticInsertModal}
      onSelect={handleSelect}
      items={insertModalItems}
      title={modalState.type === 'tag' ? 'Insert Tag' : 'Insert Template'}
    />
  );
};

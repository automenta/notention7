import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  DocumentDuplicateIcon,
  TagIcon,
  PlusCircleIcon,
  CodeBracketsIcon,
} from '../../icons';
import { useOntologyIndex } from '../../../hooks/useOntologyIndex';
import { InsertMenu } from '../InsertMenu';
import type { InsertMenuItem } from '../../../hooks/useInsertMenuItems';
import type { EditorApi } from '../../../types';

export const buttonClass = `p-2 rounded-md transition-colors hover:bg-gray-700/80 text-gray-400 hover:text-gray-200`;

export const api: {
  open: () => void;
  close: () => void;
} = {
  open: () => {},
  close: () => {},
};

export const SemanticInsertToolbar: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  return (
    <>
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      <button
        onClick={() => editorApi.plugins['semantic-insert'].open()}
        className={buttonClass}
        title="Insert Semantic Element"
      >
        <PlusCircleIcon className="h-5 w-5" />
      </button>
    </>
  );
};

type ModalView = 'main' | 'tag' | 'template' | 'property';

export const SemanticInsertModalProvider: React.FC<{
  editorApi: EditorApi;
}> = ({ editorApi }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ModalView>('main');

  const { allTags, allTemplates, allProperties } = useOntologyIndex(
    editorApi.getSettings().ontology
  );

  const openModal = useCallback(() => {
    setView('main');
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    api.open = openModal;
    api.close = closeModal;
    return () => {
      api.open = () => {};
      api.close = () => {};
    };
  }, [openModal, closeModal]);

  const items: InsertMenuItem[] = useMemo(() => {
    switch (view) {
      case 'tag':
        return allTags.map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
          type: 'tag',
          action: () => {
            const html = `<span class="widget tag" contenteditable="false" data-tag="${t.label}">#${t.label}</span>&nbsp;`;
            editorApi.insertHtml(html);
            closeModal();
          },
        }));
      case 'property':
        return allProperties.map((p) => ({
          id: p.id,
          label: p.label,
          description: p.description,
          type: 'property',
          action: () => {
            const id = `widget-${crypto.randomUUID()}`;
            const html = `<span id="${id}" class="widget property" contenteditable="false" data-key="${p.label}" data-operator="is" data-values='[""]'>[${p.label}:is:""]</span>&nbsp;`;
            editorApi.insertHtml(html);
            editorApi.scheduleWidgetEdit(id);
            closeModal();
          },
        }));
      case 'template':
        return allTemplates.map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
          type: 'template',
          action: () => {
            const propertiesHtml = Object.keys(t.attributes || {})
              .map((key) => {
                const id = `widget-${crypto.randomUUID()}`;
                return `<span id="${id}" class="widget property" contenteditable="false" data-key="${key}" data-operator="is" data-values='[""]'>[${key}:is:""]</span>`;
              })
              .join('&nbsp;');
            editorApi.insertHtml(propertiesHtml);
            closeModal();
          },
        }));
      case 'main':
      default:
        return [
          {
            id: 'insert-tag',
            label: 'Tag',
            description: 'Insert a semantic tag',
            type: 'action',
            icon: TagIcon,
            action: () => setView('tag'),
          },
          {
            id: 'insert-property',
            label: 'Property',
            description: 'Insert a key:operator:value property',
            type: 'action',
            icon: CodeBracketsIcon,
            action: () => setView('property'),
          },
          {
            id: 'insert-template',
            label: 'Template',
            description: 'Insert a pre-defined template of properties',
            type: 'action',
            icon: DocumentDuplicateIcon,
            action: () => setView('template'),
          },
        ];
    }
  }, [view, allTags, allTemplates, allProperties, editorApi, closeModal]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (item: InsertMenuItem) => {
    item.action();
  };

  const getTitle = () => {
    switch (view) {
      case 'main':
        return 'Insert Semantic Element';
      case 'tag':
        return 'Insert Tag';
      case 'property':
        return 'Insert Property';
      case 'template':
        return 'Insert Template';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-20"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{getTitle()}</h2>
          {view !== 'main' && (
            <button
              onClick={() => setView('main')}
              className="text-sm text-gray-400 hover:text-white"
            >
              Back
            </button>
          )}
        </div>
        <InsertMenu
          items={items}
          onSelect={handleSelect}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};


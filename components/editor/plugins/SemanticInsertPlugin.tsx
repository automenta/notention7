import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { DocumentDuplicateIcon, TagIcon } from '../../icons';
import { useOntologyIndex } from '../../../hooks/useOntologyIndex';
import { InsertMenu } from '../InsertMenu';
import type { InsertMenuItem } from '../../../hooks/useInsertMenuItems';
import type { EditorApi, EditorPlugin } from '../../../types';

const buttonClass = `p-2 rounded-md transition-colors hover:bg-gray-700/80 text-gray-400 hover:text-gray-200`;

type ModalType = 'tag' | 'template';

const api: {
  open: (type: ModalType) => void;
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
        onClick={() => editorApi.plugins['semantic-insert'].open('tag')}
        className={buttonClass}
        title="Insert Tag"
      >
        <TagIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => editorApi.plugins['semantic-insert'].open('template')}
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
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);

  const { allTags, allTemplates } = useOntologyIndex(
    editorApi.getSettings().ontology
  );

  const openModal = useCallback((type: ModalType) => {
    setModalType(type);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalType(null);
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
    if (modalType === 'tag') {
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
    if (modalType === 'template') {
      return allTemplates.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        type: 'template',
        action: () => {
          const propertiesHtml = Object.keys(t.attributes || {})
            .map((key) => {
              const id = `widget-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 9)}`;
              return `<span id="${id}" class="widget property" contenteditable="false" data-key="${key}" data-operator="is" data-values='[""]'>[${key}:is:""]</span>`;
            })
            .join('&nbsp;');
          const html = `<div>${propertiesHtml}</div>`;
          editorApi.insertHtml(html, () => {});
        },
      }));
    }
    return [];
  }, [modalType, allTags, allTemplates, editorApi]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (item: InsertMenuItem) => {
    item.action();
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white text-center mb-4">
          Insert {modalType === 'tag' ? 'Tag' : 'Template'}
        </h2>
        <InsertMenu items={items} onSelect={handleSelect} onClose={closeModal} />
      </div>
    </div>
  );
};


export const semanticInsertPlugin: EditorPlugin = {
  id: 'semantic-insert',
  name: 'Semantic Insert',
  ToolbarComponent: SemanticInsertToolbar,
  Modal: SemanticInsertModalProvider,
  api: api,
};

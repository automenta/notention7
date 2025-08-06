import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { InsertMenu } from '../InsertMenu';
import {
  useInsertMenuItems,
  InsertMenuMode,
} from '../../../hooks/useInsertMenuItems';
import { useOntologyIndex } from '../../../hooks/useOntologyIndex';
import { TemplateEditor } from '../TemplateEditor';
import { formatPropertyForDisplay } from '../../../utils/properties';
import type {
  EditorApi,
  EditorPlugin,
  OntologyNode,
  Property,
} from '../../../types';

type OpenMenuContext = {
  mode: InsertMenuMode;
  selectedValue?: string;
};

const api: {
  open: (
    position?: { top: number; left: number },
    context?: OpenMenuContext
  ) => void;
  close: () => void;
} = {
  open: () => {},
  close: () => {},
};

const InsertMenuProvider: React.FC<{ editorApi: EditorApi }> = ({ editorApi }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const [isTemplateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OntologyNode | null>(
    null
  );
  const [context, setContext] = useState<OpenMenuContext>({ mode: 'all' });

  const settings = editorApi.getSettings();
  const { ontology } = settings;
  const indexedOntology = useOntologyIndex(ontology);
  const items = useInsertMenuItems(indexedOntology, context.mode);

  const openMenu = useCallback(
    (pos?: { top: number; left: number }, newContext?: OpenMenuContext) => {
      let newPos = pos;
      if (!newPos) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          newPos = { top: rect.bottom + 8, left: rect.left };
        } else {
          newPos = { top: window.innerHeight / 2, left: window.innerWidth / 2 };
        }
      }
      setPosition(newPos);
      setContext(newContext || { mode: 'all' });
      setMenuOpen(true);
    },
    []
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setPosition(null);
  }, []);

  useEffect(() => {
    api.open = openMenu;
    api.close = closeMenu;

    // Cleanup on unmount
    return () => {
      api.open = () => {};
      api.close = () => {};
    };
  }, [openMenu, closeMenu]);

  if (!isMenuOpen && !isTemplateEditorOpen) {
    return null;
  }

  const handleSelect = (item) => {
    closeMenu();
    let htmlToInsert = '';

    if (item.type === 'tag') {
      htmlToInsert = `<span class="widget tag" contenteditable="false" data-tag="${item.label}">#${item.label}</span>&nbsp;`;
      editorApi.insertHtml(htmlToInsert);
    } else if (item.type === 'property') {
      // Handle creating a property from selected text
      if (context.selectedValue && context.mode === 'property') {
        const values = [context.selectedValue];
        const operator = 'is';
        const formatted = formatPropertyForDisplay(item.label, operator, values);
        htmlToInsert = `<span class="widget property" contenteditable="false" data-key="${item.label}" data-operator="${operator}" data-values='${JSON.stringify(
          values
        )}'>${formatted}</span>&nbsp;`;
        // This will replace the selected text
        editorApi.insertHtml(htmlToInsert);
      } else {
        // Handle inserting an empty property
        const widgetId = `widget-${crypto.randomUUID()}`;
        htmlToInsert = `<span id="${widgetId}" class="widget property" contenteditable="false" data-key="${item.label}" data-operator="is" data-values='[""]'>[${item.label}:is:""]</span>&nbsp;`;

        editorApi.insertHtml(htmlToInsert, () => {
          const editor = editorApi.editorRef.current;
          if (editor) {
            const newWidget = editor.querySelector<HTMLElement>(`#${widgetId}`);
            if (newWidget) {
              editorApi.setEditingWidget(newWidget);
            }
          }
        });
      }
    } else if (item.type === 'template') {
      const template = indexedOntology.allTemplates.find(
        (t) => t.id === item.id.replace('template-', '')
      );
      if (template) {
        setSelectedTemplate(template);
        setTemplateEditorOpen(true);
      }
    }
  };

  const handleTemplateSave = (properties: Property[]) => {
    const htmlToInsert = properties
      .map((prop) => {
        const { key, operator, values } = prop;
        const formatted = formatPropertyForDisplay(key, operator, values);
        return `<span class="widget property" contenteditable="false" data-key="${key}" data-operator="${operator}" data-values='${JSON.stringify(
          values
        )}'>${formatted}</span>`;
      })
      .join(' ');

    if (htmlToInsert) {
      editorApi.insertHtml(htmlToInsert + '&nbsp;');
    }
    setTemplateEditorOpen(false);
    setSelectedTemplate(null);
  };

  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position?.top}px`,
    left: `${position?.left}px`,
    zIndex: 100,
  };

  return (
    <>
      {isMenuOpen && position && ReactDOM.createPortal(
        <div style={popoverStyle}>
          <InsertMenu items={items} onSelect={handleSelect} onClose={closeMenu} />
        </div>,
        document.body
      )}
      {selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          isOpen={isTemplateEditorOpen}
          onClose={() => setTemplateEditorOpen(false)}
          onSave={handleTemplateSave}
        />
      )}
    </>
  );
};

export const insertMenuPlugin: EditorPlugin = {
  id: 'insert-menu',
  name: 'Insert Menu',
  Popover: InsertMenuProvider,
  api: api,
};

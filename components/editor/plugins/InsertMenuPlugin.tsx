import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { InsertMenu } from '../InsertMenu';
import { useInsertMenuItems } from '@/hooks/useInsertMenuItems';
import { useOntologyIndex } from '@/hooks/useOntologyIndex';
import { TemplateEditor } from '../TemplateEditor';
import type {
  EditorApi,
  OntologyNode,
  Property,
  TagWidgetNode,
  PropertyWidgetNode,
  TextNode,
} from '@/types';
import { api, OpenMenuContext } from './insertMenuApi';

// Helper to create a space node for better UX after insertion
const spaceNode = (): TextNode => ({ type: 'text', content: '\u00A0' });

export const InsertMenuProvider: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
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
    return () => {
      api.open = () => {};
      api.close = () => {};
    };
  }, [openMenu, closeMenu]);

  if (!isMenuOpen && !isTemplateEditorOpen) {
    return null;
  }

  const handleSelect = (item: any) => {
    closeMenu();

    if (item.type === 'tag') {
      const newNode: TagWidgetNode = {
        type: 'widget',
        kind: 'tag',
        id: `widget-${Date.now()}-${Math.random()}`,
        tag: item.label,
      };
      editorApi.insertNodes([newNode, spaceNode()]);
    } else if (item.type === 'property') {
      const newNode: PropertyWidgetNode = {
        type: 'widget',
        kind: 'property',
        id: `widget-${Date.now()}-${Math.random()}`,
        key: item.label,
        operator: 'is',
        values: [context.selectedValue || ''],
      };
      editorApi.insertNodes([newNode, spaceNode()]);
      // Schedule the property editor to open for the new widget
      editorApi.scheduleWidgetEdit(newNode.id);
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
    const newNodes: PropertyWidgetNode[] = properties.map((prop) => ({
      type: 'widget',
      kind: 'property',
      id: `widget-${Date.now()}-${Math.random()}`,
      key: prop.key,
      operator: prop.operator,
      values: prop.values,
    }));

    if (newNodes.length > 0) {
      const nodesToInsert = newNodes.reduce((acc, node) => {
        acc.push(node, spaceNode());
        return acc;
      }, [] as (PropertyWidgetNode | TextNode)[]);
      editorApi.insertNodes(nodesToInsert);
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
      {isMenuOpen &&
        position &&
        ReactDOM.createPortal(
          <div style={popoverStyle}>
            <InsertMenu
              items={items}
              onSelect={handleSelect}
              onClose={closeMenu}
            />
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

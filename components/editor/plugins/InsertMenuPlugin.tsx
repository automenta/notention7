import React, {useCallback, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {InsertMenu} from '../InsertMenu';
import {useInsertMenuItems} from '@/hooks/useInsertMenuItems.ts';
import {useOntologyIndex} from '@/hooks/useOntologyIndex.ts';
import {TemplateEditor} from '../TemplateEditor';
import {formatPropertyForDisplay} from '@/utils/properties.ts';
import type {EditorApi, OntologyNode, Property,} from '@/types';
import {api, OpenMenuContext} from './insertMenuApi';

export const InsertMenuProvider: React.FC<{ editorApi: EditorApi }> = ({
                                                                           editorApi,
                                                                       }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [position, setPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);
    const [isTemplateEditorOpen, setTemplateEditorOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<OntologyNode | null>(
        null
    );
    const [context, setContext] = useState<OpenMenuContext>({mode: 'all'});

    const settings = editorApi.getSettings();
    const {ontology} = settings;
    const indexedOntology = useOntologyIndex(ontology);
    const items = useInsertMenuItems(indexedOntology, context.mode);

    const openMenu = useCallback(
        (pos?: { top: number; left: number }, newContext?: OpenMenuContext) => {
            let newPos = pos;
            if (!newPos) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    let rect = range.getBoundingClientRect();
                    // If the bounding rect is all zeros, it's likely an invalid selection
                    if (rect.top === 0 && rect.left === 0 && rect.bottom === 0 && rect.right === 0) {
                        // Fallback to positioning relative to the editor container
                        const editorRect = editorApi.editorRef.current?.getBoundingClientRect();
                        if (editorRect) {
                           rect = editorRect;
                        }
                    }
                    newPos = {top: rect.bottom + 8, left: rect.left};
                } else {
                    newPos = {top: window.innerHeight / 2, left: window.innerWidth / 2};
                }
            }
            setPosition(newPos);
            setContext(newContext || {mode: 'all'});
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
            api.open = () => {
            };
            api.close = () => {
            };
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
            const key = item.label;
            const operator = 'is';
            const value = context.selectedValue || '';

            const newWidget = document.createElement('span');
            newWidget.contentEditable = 'false';
            newWidget.className =
                'bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md text-sm mx-1';
            newWidget.dataset.widget = 'semantic-property';
            newWidget.dataset.property = key;
            newWidget.dataset.operator = operator;
            const values = [value];
            newWidget.dataset.values = JSON.stringify(values);
            newWidget.textContent = `${key} ${operator} ${values.join(' and ')}`;

            // Insert a space after the widget for better UX
            const space = document.createTextNode('\u00A0');

            editorApi.insertHtml(newWidget.outerHTML + space.textContent, () => {
                // We will add portal rendering logic here later.
                // For now, we can try to set the editing widget
                const editor = editorApi.editorRef.current;
                if (editor) {
                    // This is a bit brittle, we need a better way to find the inserted node
                    // For now, let's assume it's the last one of its kind
                    const allWidgets = editor.querySelectorAll<HTMLElement>(
                        '[data-widget="semantic-property"]'
                    );
                    const insertedWidget = allWidgets[allWidgets.length - 1];
                    if (insertedWidget) {
                        editorApi.setEditingWidget(insertedWidget);
                    }
                }
            });
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
                const {key, operator, values} = prop;
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

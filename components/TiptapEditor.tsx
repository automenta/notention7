import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Note, AppSettings } from '../types';
import { useNoteSemantics } from '../hooks/useNoteSemantics';
import { useOntologyIndex } from '../hooks/useOntologyIndex';
import { Toolbar } from './editor/Toolbar';
import { EditorHeader } from './editor/EditorHeader';
import { SemanticInsertModal, type InsertMenuItem } from './editor/SemanticInsertModal';
import { PropertyEditorPopover } from './editor/PropertyEditorPopover';
import { getTextFromHtml } from '../utils/nostr';
import { formatPropertyForDisplay } from '../utils/properties';
import { getNoteSemantics } from '../utils/noteSemantics';

// A one-time conversion for legacy note content from plain text to widgets.
const convertPlainTextToWidgets = (html: string): string => {
    if (!html) return html;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // If widgets already exist, assume it's modern format
    if (tempDiv.querySelector('.widget[data-operator]')) return html;

    let widgetizedHtml = html;
    // Regex for legacy [key:value] format
    const propertyRegex = /\[\s*([^:<>]+?)\s*:\s*([^\]<>]*?)\s*\]/g;
    const tagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)/g;

    widgetizedHtml = widgetizedHtml.replace(propertyRegex, (match, key, value) => {
        const k = key.trim();
        const v = value ? value.trim() : '';
        const operator = 'is';
        const values = [v];
        return `<span class="widget property" contenteditable="false" data-key="${k}" data-operator="${operator}" data-values='${JSON.stringify(values)}'>${formatPropertyForDisplay(k, operator, values)}</span>`;
    });
    
    widgetizedHtml = widgetizedHtml.replace(tagRegex, (match, tag) => {
        const prefix = match.startsWith(' ') ? ' ' : '';
        return `${prefix}<span class="widget tag" contenteditable="false" data-tag="${tag}">#${tag}</span>`;
    });
    
    return widgetizedHtml;
};

export const TiptapEditor: React.FC<{
    note: Note;
    onSave: (note: Note) => void;
    onDelete: (id: string) => void;
    settings: AppSettings;
}> = ({ note, onSave, onDelete, settings }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(convertPlainTextToWidgets(note.content));
    const saveTimeoutRef = useRef<number | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const { tags, properties } = useNoteSemantics(content);
    const { allTags, allTemplates, propertyTypes } = useOntologyIndex(settings.ontology);

    const [insertModalState, setInsertModalState] = useState<{ open: boolean; type: 'tag' | 'template' | null }>({ open: false, type: null });
    const [editingWidget, setEditingWidget] = useState<HTMLElement | null>(null);

    
    
    useEffect(() => {
        const currentlyEditing = editorRef.current?.querySelector('.is-editing');
        if (currentlyEditing && currentlyEditing !== editingWidget) {
            currentlyEditing.classList.remove('is-editing');
        }
        if (editingWidget) {
            editingWidget.classList.add('is-editing');
        }
        return () => {
            editingWidget?.classList.remove('is-editing');
        }
    }, [editingWidget]);

    

    const debouncedSave = useCallback(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = window.setTimeout(() => {
            const currentContent = editorRef.current?.innerHTML || content;
            const { tags: updatedTags, properties: updatedProperties } = getNoteSemantics(currentContent);
            onSave({ ...note, title, content: currentContent, tags: updatedTags, properties: updatedProperties, updatedAt: new Date().toISOString() });
        }, 500);
    }, [note, onSave, title, content]);

    useEffect(() => {
        debouncedSave();
        return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
    }, [title, content, debouncedSave]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        if (editingWidget) setEditingWidget(null);
        processInputRules(e.currentTarget);
        setContent(e.currentTarget.innerHTML);
    };

    const processInputRules = (editor: HTMLDivElement): boolean => {
        const selection = window.getSelection();
        if (!selection || !selection.isCollapsed || selection.rangeCount === 0) return false;

        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        if (container.nodeType !== Node.TEXT_NODE) return false;

        const textBeforeCaret = container.textContent?.substring(0, range.startOffset) || '';
        
        // Rule: [key:value]
        const propMatch = textBeforeCaret.match(/(\[([^:\]]+?):([^\]]*?)\])$/);
        if (propMatch) {
            const [fullMatch, , key, value] = propMatch.map(s => s || '');
            if (key.trim()) {
                const offsetToReplace = fullMatch.length;
                if (offsetToReplace > range.startOffset) return false;

                range.setStart(container, range.startOffset - offsetToReplace);
                range.deleteContents();
                
                const widgetId = `widget-${crypto.randomUUID()}`;
                const operator = 'is';
                const values = [value.trim()];
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = `<span id="${widgetId}" class="widget property" contenteditable="false" data-key="${key.trim()}" data-operator="${operator}" data-values='${JSON.stringify(values)}'>${formatPropertyForDisplay(key.trim(), operator, values)}</span>&nbsp;`;

                const nodeToInsert = tempDiv.firstChild;
                if(nodeToInsert) {
                    range.insertNode(nodeToInsert);
                    range.setStartAfter(nodeToInsert);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                return true;
            }
        }
        return false;
    }
    
    const handleOpenInsertMenu = (type: 'tag' | 'template') => {
        // Ensure the editor has focus to preserve the caret position for insertion.
        editorRef.current?.focus();
        setInsertModalState({ open: true, type });
    };

    const handleSemanticInsert = (item: InsertMenuItem) => {
        const editor = editorRef.current;
        const selection = window.getSelection();

        if (!editor || !selection || selection.rangeCount === 0) {
            setInsertModalState({ open: false, type: null });
            return;
        }

        const range = selection.getRangeAt(0);
        range.deleteContents();

        let htmlToInsert = '';
        let firstWidgetId: string | null = null;
        if (insertModalState.type === 'tag') {
            htmlToInsert = `<span class="widget tag" contenteditable="false" data-tag="${item.label}">#${item.label}</span>&nbsp;`;
        } else if (insertModalState.type === 'template') {
            const template = item.template;
            if (template && template.attributes) {
                htmlToInsert = Object.keys(template.attributes).map((key, index) => {
                    const k = key.trim();
                    const v = [''];
                    const op = 'is';
                    const widgetId = `widget-${crypto.randomUUID()}`;
                    if (index === 0) firstWidgetId = widgetId;
                    return `<span id="${widgetId}" class="widget property" contenteditable="false" data-key="${k}" data-operator="${op}" data-values='${JSON.stringify(v)}'>${formatPropertyForDisplay(k, op, v)}</span>`;
                }).join(' ') + '&nbsp;';
            }
        }
        
        if (!htmlToInsert) {
            setInsertModalState({ open: false, type: null });
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlToInsert;
        const nodesToInsert = Array.from(tempDiv.childNodes);
        
        let lastNode: Node | null = null;
        nodesToInsert.forEach(node => {
            range.insertNode(node);
            lastNode = node;
            range.setStartAfter(node);
            range.collapse(true);
        });
        
        if(lastNode) {
            selection.removeAllRanges();
            selection.addRange(range);
        }

        setContent(editor.innerHTML);
        
        if (firstWidgetId) {
            setTimeout(() => {
                const firstWidget = editor.querySelector<HTMLElement>(`#${firstWidgetId}`);
                if (firstWidget) {
                   setEditingWidget(firstWidget);
                }
            }, 50);
        }
        
        setInsertModalState({ open: false, type: null });
    };


    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const widget = target.closest<HTMLElement>('.widget.property');
        if (widget) {
            e.preventDefault();
            e.stopPropagation();
            if(editingWidget !== widget) {
                if (!widget.id) {
                    widget.id = `widget-${crypto.randomUUID()}`;
                }
                setEditingWidget(widget);
            }
        } else if (editingWidget) {
            setEditingWidget(null);
        }
    };
    
    const handleSaveProperty = (widgetId: string, key: string, operator: string, values: string[]) => {
        const editor = editorRef.current;
        const widget = editor?.querySelector<HTMLElement>(`#${widgetId}`);
        if (widget) {
            widget.dataset.key = key;
            widget.dataset.operator = operator;
            widget.dataset.values = JSON.stringify(values);
            
            widget.innerHTML = formatPropertyForDisplay(key, operator, values);

            setContent(editor.innerHTML);
        }
        setEditingWidget(null);
    };

    const handleDeleteProperty = (widgetId: string) => {
        const editor = editorRef.current;
        const widget = editor?.querySelector(`#${widgetId}`);
        if (widget) {
            const nextSibling = widget.nextSibling;
            // Remove trailing space if it exists to avoid double spaces
            if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && nextSibling.textContent?.startsWith('\u00A0')) {
                nextSibling.textContent = nextSibling.textContent.substring(1);
            }
            widget.remove();
            setContent(editor.innerHTML);
        }
        setEditingWidget(null);
    }
    
    const handleSetLink = useCallback(() => {
        editorRef.current?.focus();
        const url = window.prompt('URL', document.queryCommandValue('createLink'));
        if (url === null) return;
        document.execCommand(url ? 'createLink' : 'unlink', false, url);
    }, [editorRef]);

    const handleInsertSummary = (summary: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand('insertHTML', false, `<blockquote><p>${summary}</p></blockquote><p></p>`);
            setContent(editorRef.current.innerHTML);
        }
    };

    const insertModalItems = useMemo(() => {
        if (insertModalState.type === 'tag') {
            return allTags.map(t => ({ id: t.id, label: t.label, description: t.description }));
        }
        if (insertModalState.type === 'template') {
            return allTemplates.map(t => ({ id: t.id, label: t.label, description: t.description, template: t }));
        }
        return [];
    }, [insertModalState.type, allTags, allTemplates]);


    return (
        <div className="relative flex flex-col h-full bg-gray-800/50 rounded-lg overflow-hidden">
            <EditorHeader note={note} contentText={useMemo(() => getTextFromHtml(content), [content])} settings={settings} title={title} setTitle={setTitle} onDelete={onDelete} onSave={onSave} onInsertSummary={handleInsertSummary} tags={tags} properties={properties} />
            <Toolbar 
                editorRef={editorRef} 
                onLink={handleSetLink} 
                onInsertTag={() => handleOpenInsertMenu('tag')}
                onInsertTemplate={() => handleOpenInsertMenu('template')}
            />
            <div className="flex-grow flex flex-col overflow-y-auto note-content relative">
                <div
                    ref={editorRef}
                    className="ProseMirror"
                    contentEditable={!editingWidget}
                    onInput={handleInput}
                    onClick={handleEditorClick}
                    suppressContentEditableWarning={true}
                    data-placeholder="Start writing..."
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
            
            {insertModalState.open && (
                <SemanticInsertModal
                    isOpen={insertModalState.open}
                    onClose={() => setInsertModalState({ open: false, type: null })}
                    onSelect={handleSemanticInsert}
                    items={insertModalItems}
                    title={insertModalState.type === 'tag' ? 'Insert Tag' : 'Insert Template'}
                />
            )}

            {editingWidget && (
                <PropertyEditorPopover 
                    widgetEl={editingWidget}
                    onSave={handleSaveProperty}
                    onDelete={handleDeleteProperty}
                    onClose={() => setEditingWidget(null)}
                    propertyTypes={propertyTypes}
                />
            )}
            <div className="flex-shrink-0 p-2 text-xs text-center text-gray-500 border-t border-gray-700/50">
                {note.nostrEventId && note.publishedAt ? `Published on Nostr: ${new Date(note.publishedAt).toLocaleString()}` : `Last saved: ${new Date(note.updatedAt).toLocaleString()}`}
            </div>
        </div>
    );
};
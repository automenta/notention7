import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Note, AppSettings, OntologyNode } from '../types';
import { useNoteSemantics } from '../hooks/useNoteSemantics';
import { useOntologyIndex } from '../hooks/useOntologyIndex';
import { Toolbar } from './editor/Toolbar';
import { EditorHeader } from './editor/EditorHeader';
import { InsertMenu, type InsertMenuItem } from './editor/InsertMenu';
import { getTextFromHtml } from '../utils/nostr';

interface NoteEditorProps {
    note: Note;
    onSave: (note: Note) => void;
    onDelete: (id: string) => void;
    settings: AppSettings;
}

const generateHighlights = (html: string): string => {
    if (!html) return '';
    // Use a temporary div to avoid replacing within attributes.
    // This is a simplified approach. A more robust solution would be a proper parser.
    // The goal here is to highlight without breaking existing html formatting.
    let highlightedHtml = html;

    // Highlight properties: [key: value]
    highlightedHtml = highlightedHtml.replace(
        /\[\s*([^:]+?)\s*:\s*([^\]]+?)\s*\]/g,
        (match, key, value) => `<span class="widget property">[<span class="property-key">${key.trim()}</span>: <span class="property-value">${value.trim()}</span>]</span>`
    );

    // Highlight tags: #tag
    highlightedHtml = highlightedHtml.replace(
        /#([a-zA-Z0-9_]+)/g,
        match => `<span class="widget tag">${match}</span>`
    );

    return highlightedHtml;
};


export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete, settings }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [highlightedContent, setHighlightedContent] = useState('');

    const saveTimeoutRef = useRef<number | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const editorWrapperRef = useRef<HTMLDivElement>(null);

    const { tags, properties } = useNoteSemantics(content);
    const { allTags, allTemplates } = useOntologyIndex(settings.ontology);

    const [menuState, setMenuState] = useState<{
        open: boolean;
        position: { top: number; left: number };
        items: InsertMenuItem[];
        query: string;
        trigger: string;
    }>({ open: false, position: { top: 0, left: 0 }, items: [], query: '', trigger: '' });
    
    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
        if (editorRef.current) {
            editorRef.current.innerHTML = note.content;
        }
    }, [note.id]);
    
    useEffect(() => {
        setHighlightedContent(generateHighlights(content));
    }, [content]);

    const debouncedSave = useCallback(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = window.setTimeout(() => {
            if (editorRef.current) {
                const currentContent = editorRef.current.innerHTML;
                onSave({
                  ...note,
                  title: title,
                  content: currentContent,
                  tags,
                  properties,
                  updatedAt: new Date().toISOString()
                });
            }
        }, 500);
    }, [note, title, tags, properties, onSave]);

    useEffect(() => {
        debouncedSave();
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [title, content, debouncedSave]);
    
    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget.innerHTML;
        setContent(newContent);
        checkForMenuTrigger(e.currentTarget);
    };
    
    const checkForMenuTrigger = (editor: HTMLDivElement) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
            setMenuState(s => ({ ...s, open: false }));
            return;
        }
        const range = selection.getRangeAt(0);
        const textBeforeCaret = range.startContainer.textContent?.substring(0, range.startOffset) || '';
        
        const tagMatch = textBeforeCaret.match(/#(\w*)$/);
        const commandMatch = textBeforeCaret.match(/\/(\w*)$/);
        
        const match = commandMatch || tagMatch;

        if (match) {
            const rect = range.getBoundingClientRect();
            const trigger = match[0][0];
            const query = match[1];

            const menuItems = trigger === '#'
                ? allTags.map(t => ({ id: t.id, label: t.label, description: t.description }))
                : allTemplates.map(t => ({ id: t.id, label: t.label, description: t.description, template: t }));

            setMenuState({
                open: true,
                position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
                items: menuItems,
                query,
                trigger,
            });
        } else {
            setMenuState(s => ({ ...s, open: false }));
        }
    };

    const handleMenuSelect = (item: InsertMenuItem) => {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;

        const range = selection.getRangeAt(0);
        const textToReplace = `${menuState.trigger}${menuState.query}`;
        
        // Move range start back to encompass the trigger text
        range.setStart(range.startContainer, range.startOffset - textToReplace.length);
        range.deleteContents();

        let textToInsert = '';
        if (menuState.trigger === '#') {
            textToInsert = `#${item.label} `;
        } else if (menuState.trigger === '/') {
            const template = (item as any).template as OntologyNode;
            if (template && template.attributes) {
                textToInsert = Object.keys(template.attributes).map(key => `[${key}: ]`).join('\n') + '\n';
            }
        }
        
        range.insertNode(document.createTextNode(textToInsert));
        
        // Move cursor to the end of inserted text
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Refocus and update content
        editorRef.current.focus();
        setContent(editorRef.current.innerHTML);
        setMenuState({ ...menuState, open: false });
    };


    const handleSetLink = useCallback(() => {
        const previousUrl = document.queryCommandValue('createLink');
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            document.execCommand('unlink', false);
        } else {
             document.execCommand('createLink', false, url);
        }
    }, []);

    const handleInsertSummary = (summary: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand('insertHTML', false, `<blockquote><p>${summary}</p></blockquote><p></p>`);
            setContent(editorRef.current.innerHTML);
        }
    };
    
    const isPublished = !!note.nostrEventId;
    const contentTextForHeader = useMemo(() => getTextFromHtml(content), [content]);

    return (
        <div className="relative flex flex-col h-full bg-gray-800/50 rounded-lg overflow-hidden">
            <EditorHeader 
                note={note}
                contentText={contentTextForHeader}
                settings={settings}
                title={title}
                setTitle={setTitle}
                onDelete={onDelete}
                onSave={onSave}
                onInsertSummary={handleInsertSummary}
                tags={tags}
                properties={properties}
            />

            <Toolbar editorRef={editorRef} onLink={handleSetLink} />
            
            <div ref={editorWrapperRef} className="flex-grow flex flex-col overflow-y-auto note-content relative">
                <div
                    className="ProseMirror highlights"
                    dangerouslySetInnerHTML={{ __html: highlightedContent }}
                />
                <div
                    ref={editorRef}
                    className="ProseMirror editor-input"
                    contentEditable={true}
                    onInput={handleContentChange}
                    onKeyUp={() => checkForMenuTrigger(editorRef.current!)}
                    onClick={() => checkForMenuTrigger(editorRef.current!)}
                    suppressContentEditableWarning={true}
                    data-placeholder="Start writing with #tags, [properties], or / for templates..."
                    onScroll={(e) => {
                        const target = e.target as HTMLDivElement;
                        if (editorWrapperRef.current) {
                            const highlightLayer = editorWrapperRef.current.querySelector('.highlights') as HTMLDivElement;
                            if (highlightLayer) {
                                highlightLayer.scrollTop = target.scrollTop;
                                highlightLayer.scrollLeft = target.scrollLeft;
                            }
                        }
                    }}
                />
            </div>
             {menuState.open && (
                <InsertMenu
                    items={menuState.items}
                    query={menuState.query}
                    onSelect={handleMenuSelect}
                    onClose={() => setMenuState(s => ({ ...s, open: false }))}
                    position={menuState.position}
                />
            )}
             <div className="flex-shrink-0 p-2 text-xs text-center text-gray-500 border-t border-gray-700/50">
                {isPublished && note.publishedAt ? `Published on Nostr: ${new Date(note.publishedAt).toLocaleString()}` : `Last saved: ${new Date(note.updatedAt).toLocaleString()}`}
            </div>
        </div>
    );
};
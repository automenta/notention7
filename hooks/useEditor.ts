import React, {useCallback, useMemo, useRef, useState} from 'react';
import {EditorPlugin, EditorApi} from '../types/editor';

const createEditorApi = (editorRef: React.RefObject<HTMLDivElement>): EditorApi => {
    const focus = () => editorRef.current?.focus();

    const execCommand = (command: string, value?: string) => {
        focus();
        document.execCommand(command, false, value);
    };

    const queryCommandState = (command: string) => {
        try {
            return document.queryCommandState(command);
        } catch (e) {
            return false;
        }
    };

    const getSelectionParent = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        return selection.getRangeAt(0).startContainer.parentElement;
    }

    const toggleBlock = (tag: string) => {
        focus();
        const parent = getSelectionParent();
        if (parent?.closest(tag)) {
            execCommand('formatBlock', '<p>');
        } else {
            execCommand('formatBlock', `<${tag}>`);
        }
    }

    return {
        editorRef,
        execCommand,
        toggleBlock,
        queryCommandState,
        getSelectionParent
    };
};

import { AppSettings, Note } from '../types';

export const useEditor = (
    plugins: EditorPlugin[],
    note: Note,
    settings: AppSettings,
    onSave: (note: Note) => void,
    onDelete: (id: string) => void,
) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState(note.content);
    const [semanticModalState, setSemanticModalState] = useState<{ open: boolean; type: 'tag' | 'template' | null }>({ open: false, type: null });
    const [editingWidget, setEditingWidget] = useState<HTMLElement | null>(null);

    const editorApi: EditorApi = useMemo(() => {
        const baseApi = createEditorApi(editorRef);

        const insertHtml = (html: string) => {
            baseApi.focus();
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const nodesToInsert = Array.from(tempDiv.childNodes);
            nodesToInsert.forEach(node => {
                range.insertNode(node);
                range.setStartAfter(node);
                range.collapse(true);
            });
            selection.removeAllRanges();
            selection.addRange(range);
        };

        const updateContent = () => {
            if (editorRef.current) {
                setContent(editorRef.current.innerHTML);
            }
        };

        const updateNote = (updatedFields: Partial<Note>) => {
            const updatedNote = { ...note, ...updatedFields, updatedAt: new Date().toISOString() };
            onSave(updatedNote);
        };

        const deleteNote = () => {
            onDelete(note.id);
        };

        return {
            ...baseApi,
            openSemanticInsertModal: (type: 'tag' | 'template') => setSemanticModalState({ open: true, type }),
            closeSemanticInsertModal: () => setSemanticModalState({ open: false, type: null }),
            getSemanticModalState: () => semanticModalState,
            insertHtml,
            getNote: () => note,
            getSettings: () => settings,
            setEditingWidget,
            getEditingWidget: () => editingWidget,
            updateContent,
            updateNote,
            deleteNote,
        };
    }, [editorRef, semanticModalState, note, settings, editingWidget, onSave, onDelete]);

    const handleInput = useCallback((event: React.FormEvent<HTMLDivElement>) => {
        for (const plugin of plugins) {
            if (plugin.onInput?.(event, editorApi)) {
                return;
            }
        }
        setContent(event.currentTarget.innerHTML);
    }, [plugins, editorApi]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        for (const plugin of plugins) {
            if (plugin.onClick?.(event, editorApi)) {
                return;
            }
        }
    }, [plugins, editorApi]);

    const toolbarComponents = useMemo(() => plugins.map(p => p.ToolbarComponent).filter(Boolean), [plugins]);
    const modalComponents = useMemo(() => plugins.map(p => p.Modal).filter(Boolean), [plugins]);
    const popoverComponents = useMemo(() => plugins.map(p => p.Popover).filter(Boolean), [plugins]);
    const headerComponents = useMemo(() => plugins.map(p => p.HeaderComponent).filter(Boolean), [plugins]);

    return {
        editorRef,
        content,
        setContent,
        handleInput,
        handleClick,
        toolbarComponents,
        modalComponents,
        popoverComponents,
        headerComponents,
        editorApi, // Pass the full API down to the editor component
    };
};

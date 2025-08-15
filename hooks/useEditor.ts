import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { sanitizeHTML } from '../utils/sanitize';
import * as Commands from '../utils/editorCommands';
import type {
    AppSettings,
    EditorApi,
    EditorPlugin,
    Note,
} from '@/types';
import {
    editorReducer,
    type EditorState,
} from './reducers/editorReducer';
import { useEditorEvents } from './useEditorEvents';
import { parseHTML } from '../utils/contentModel';
import { Transaction } from '@/utils/transaction';

const AUTO_SAVE_DEBOUNCE_MS = 1000;

// --- API Creation ---

const createCommandApi = (focus: () => void) => ({
    execCommand: (command: string, value?: string) => {
        focus();
        Commands.execCommand(command, value);
    },
    toggleBlock: (tag: string) => {
        focus();
        Commands.toggleBlock(tag);
    },
    queryCommandState: Commands.queryCommandState,
});

const createNoteApi = (
    note: Note,
    state: EditorState,
    onSave: (note: Note) => void,
    onDelete: (id: string) => void
) => ({
    getNote: () => note,
    updateNote: (updatedFields: Partial<Note>) => {
        const updatedNote = {
            ...note,
            content: state.content,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
        };
        onSave(updatedNote);
    },
    deleteNote: () => onDelete(note.id),
});

const createEditorApi = (
    state: EditorState,
    dispatch: React.Dispatch<any>, // Using any to avoid circular dependency issues with Transaction
    note: Note,
    settings: AppSettings,
    onSave: (note: Note) => void,
    onDelete: (id: string) => void,
    plugins: EditorPlugin[]
): EditorApi => {
    const focus = () => (state as any).editorRef.current?.focus();

    const pluginApis = plugins.reduce(
        (acc, plugin) => {
            if (plugin.api) {
                acc[plugin.id] = plugin.api;
            }
            return acc;
        },
        {} as { [pluginId: string]: unknown }
    );

    return {
        editorRef: (state as any).editorRef,
        state,
        dispatchTransaction: (tr: Transaction) => {
            dispatch({ type: 'APPLY_TRANSACTION', payload: tr });
        },
        ...createCommandApi(focus),
        ...createNoteApi(note, state, onSave, onDelete),
        getSettings: () => settings,
        getSelectionParent: Commands.getSelectionParent,
        syncViewToModel: () => {
            if ((state as any).editorRef.current) {
                const sanitizedContent = sanitizeHTML((state as any).editorRef.current.innerHTML);
                dispatch({ type: 'SET_CONTENT_EXTERNALLY', payload: sanitizedContent });
            }
        },
        setEditingWidget: (widget: HTMLElement | null) =>
            dispatch({ type: 'SET_EDITING_WIDGET', payload: widget }),
        getEditingWidget: () => state.editingWidget,
        scheduleWidgetEdit: (widgetId: string) => {
            dispatch({ type: 'SCHEDULE_WIDGET_EDIT', payload: widgetId });
        },
        plugins: pluginApis,
    };
};

export const useEditor = (
    plugins: EditorPlugin[],
    note: Note,
    settings: AppSettings,
    onSave: (note: Note) => void,
    onDelete: (id: string) => void
) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const initialState: EditorState = {
        content: note.content,
        contentModel: parseHTML(note.content),
        selection: null,
        editingWidget: null,
        pendingWidgetEdit: null,
    };

    const [state, dispatch] = useReducer(editorReducer, initialState);
    const noteRef = useRef(note);
    useEffect(() => {
        noteRef.current = note;
    }, [note]);

    // Auto-save content changes with debounce
    useEffect(() => {
        const isInitialMount = noteRef.current.content === state.content;

        const handler = setTimeout(() => {
            if (noteRef.current.content === state.content && !isInitialMount) {
                return;
            }
            if (isInitialMount) {
                return;
            }

            const newTags: string[] = [];
            const newProperties: Note['properties'] = [];
            state.contentModel.forEach(block => {
                if (block.type === 'paragraph') {
                    block.content.forEach(node => {
                        if (node.type === 'widget') {
                            if (node.kind === 'tag') {
                                newTags.push(node.tag);
                            } else if (node.kind === 'property') {
                                newProperties.push({
                                    key: node.key,
                                    op: node.operator,
                                    values: node.values as string[],
                                });
                            }
                        }
                    });
                }
            });

            onSave({
                ...noteRef.current,
                content: state.content,
                tags: newTags,
                properties: newProperties,
                updatedAt: new Date().toISOString(),
            });
        }, AUTO_SAVE_DEBOUNCE_MS);

        return () => {
            clearTimeout(handler);
        };
    }, [state.content, state.contentModel, onSave]);

    const editorApi: EditorApi = useMemo(
        () =>
            createEditorApi(
                { ...state, editorRef },
                dispatch,
                note,
                settings,
                onSave,
                onDelete,
                plugins
            ),
        [state, dispatch, note, settings, onSave, onDelete, plugins]
    );

    const { handleInput, handleClick, handleKeyDown, handlePaste } = useEditorEvents(
        plugins,
        editorApi
    );

    const toolbarComponents = useMemo(
        () => plugins.map((p) => p.ToolbarComponent).filter(Boolean),
        [plugins]
    );
    const modalComponents = useMemo(
        () => plugins.map((p) => p.Modal).filter(Boolean),
        [plugins]
    );
    const popoverComponents = useMemo(
        () => plugins.map((p) => p.Popover).filter(Boolean),
        [plugins]
    );
    const headerComponents = useMemo(
        () => plugins.map((p) => p.HeaderComponent).filter(Boolean),
        [plugins]
    );

    return {
        editorRef,
        content: state.content,
        handleInput,
        handleClick,
        handleKeyDown,
        handlePaste,
        toolbarComponents,
        modalComponents,
        popoverComponents,
        headerComponents,
        editorApi,
        pendingWidgetEdit: state.pendingWidgetEdit,
    };
};

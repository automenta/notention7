import React, { useCallback, useMemo, useRef, useReducer } from 'react';
import { EditorPlugin, EditorApi } from '../types/editor';
import { sanitizeHTML } from '../utils/sanitize';
import * as Commands from '../utils/editorCommands';

// --- State Management with useReducer ---

interface EditorState {
  content: string;
  semanticModal: {
    open: boolean;
    type: 'tag' | 'template' | null;
  };
  editingWidget: HTMLElement | null;
}

type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | {
      type: 'TOGGLE_SEMANTIC_MODAL';
      payload: { open: boolean; type?: 'tag' | 'template' | null };
    }
  | { type: 'SET_EDITING_WIDGET'; payload: HTMLElement | null };

const editorReducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'TOGGLE_SEMANTIC_MODAL':
      return {
        ...state,
        semanticModal: { ...state.semanticModal, ...action.payload },
      };
    case 'SET_EDITING_WIDGET':
      return { ...state, editingWidget: action.payload };
    default:
      return state;
  }
};

// --- API Creation ---

const createEditorApi = (
  editorRef: React.RefObject<HTMLDivElement>,
  dispatch: React.Dispatch<EditorAction>,
  state: EditorState,
  note: Note,
  settings: AppSettings,
  onSave: (note: Note) => void,
  onDelete: (id: string) => void
): EditorApi => {
  const focus = () => editorRef.current?.focus();

  const execCommand = (command: string, value?: string) => {
    focus();
    Commands.execCommand(command, value);
  };

  const toggleBlock = (tag: string) => {
    focus();
    Commands.toggleBlock(tag);
  };

  const updateContent = () => {
    if (editorRef.current) {
      const sanitizedContent = sanitizeHTML(editorRef.current.innerHTML);
      dispatch({ type: 'SET_CONTENT', payload: sanitizedContent });
    }
  };

  const insertHtml = (html: string) => {
    focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const sanitizedHtml = sanitizeHTML(html);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedHtml;

    const nodesToInsert = Array.from(tempDiv.childNodes);
    nodesToInsert.forEach((node) => {
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
    });
    selection.removeAllRanges();
    selection.addRange(range);
    updateContent();
  };

  const updateNote = (updatedFields: Partial<Note>) => {
    const updatedNote = {
      ...note,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedNote);
  };

  return {
    editorRef,
    execCommand,
    toggleBlock,
    queryCommandState: Commands.queryCommandState,
    getSelectionParent: Commands.getSelectionParent,
    openSemanticInsertModal: (type: 'tag' | 'template') =>
      dispatch({
        type: 'TOGGLE_SEMANTIC_MODAL',
        payload: { open: true, type },
      }),
    closeSemanticInsertModal: () =>
      dispatch({ type: 'TOGGLE_SEMANTIC_MODAL', payload: { open: false } }),
    getSemanticModalState: () => state.semanticModal,
    insertHtml,
    getNote: () => note,
    getSettings: () => settings,
    setEditingWidget: (widget) =>
      dispatch({ type: 'SET_EDITING_WIDGET', payload: widget }),
    getEditingWidget: () => state.editingWidget,
    updateContent,
    updateNote,
    deleteNote: () => onDelete(note.id),
  };
};

import { AppSettings, Note } from '../types';

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
    semanticModal: { open: false, type: null },
    editingWidget: null,
  };

  const [state, dispatch] = useReducer(editorReducer, initialState);

  const editorApi: EditorApi = useMemo(
    () =>
      createEditorApi(
        editorRef,
        dispatch,
        state,
        note,
        settings,
        onSave,
        onDelete
      ),
    [dispatch, state, note, settings, onSave, onDelete]
  );

  const handleInput = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      for (const plugin of plugins) {
        if (plugin.onInput?.(event, editorApi)) {
          return;
        }
      }
      const sanitizedContent = sanitizeHTML(event.currentTarget.innerHTML);
      dispatch({ type: 'SET_CONTENT', payload: sanitizedContent });
    },
    [plugins, editorApi, dispatch]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      for (const plugin of plugins) {
        if (plugin.onClick?.(event, editorApi)) {
          return;
        }
      }
    },
    [plugins, editorApi]
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
    toolbarComponents,
    modalComponents,
    popoverComponents,
    headerComponents,
    editorApi,
  };
};

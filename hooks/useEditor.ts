import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  EditorApi,
  EditorPlugin,
  EditorState,
  EditorAction,
  CreateEditorApiProps,
} from '../types/editor';
import { sanitizeHTML } from '../utils/sanitize';
import * as Commands from '../utils/editorCommands';
import { AppSettings, Note } from '../types';

// --- State Management with useReducer ---

/**
 * Reducer for managing the editor's internal state.
 * @param state - The current editor state.
 * @param action - The dispatched action.
 * @returns The new editor state.
 */
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

/**
 * Creates the Editor API object that is passed to plugins and components.
 * This API provides a stable interface for interacting with the editor,
 * abstracting away the internal state management.
 * @param props - An object containing all necessary dependencies for the API.
 * @returns An `EditorApi` object.
 */
const createEditorApi = ({
  editorRef,
  dispatch,
  state,
  note,
  settings,
  onSave,
  onDelete,
}: CreateEditorApiProps): EditorApi => {
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
      content: state.content, // Ensure latest content is saved
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

/**
 * A comprehensive hook for managing a rich text editor with a plugin-based architecture.
 *
 * @param plugins - An array of `EditorPlugin` objects that extend the editor's functionality.
 * @param note - The note object to be edited.
 * @param settings - The application settings.
 * @param onSave - Callback function to save the note.
 * @param onDelete - Callback function to delete the note.
 * @returns An object containing the editor ref, state, event handlers, and components rendered by plugins.
 */
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

  // Auto-save content changes with a debounce to avoid excessive writes.
  useEffect(() => {
    // Prevent saving on initial mount or if content is unchanged.
    if (state.content === note.content) {
      return;
    }
    const handler = setTimeout(() => {
      onSave({
        ...note,
        content: state.content,
        updatedAt: new Date().toISOString(),
      });
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [state.content, note, onSave]);

  const editorApi: EditorApi = useMemo(
    () =>
      createEditorApi({
        editorRef,
        dispatch,
        state,
        note,
        settings,
        onSave,
        onDelete,
      }),
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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // When a widget's popover is active (e.g., editing a property),
      // we want to prevent keyboard input from affecting the main editor body.
      // However, we still allow navigation keys like arrows, tab, and escape
      // for accessibility and to allow the user to move away from the widget.
      if (state.editingWidget) {
        if (
          ![
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Escape',
            'Tab',
          ].includes(event.key)
        ) {
          event.preventDefault();
        }
      }
    },
    [state.editingWidget]
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
    toolbarComponents,
    modalComponents,
    popoverComponents,
    headerComponents,
    editorApi,
  };
};

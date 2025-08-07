import React, {
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { sanitizeHTML } from '../utils/sanitize';
import * as Commands from '../utils/editorCommands';
import type { AppSettings, Note, EditorApi, EditorPlugin } from '../types';
import {
  editorReducer,
  type EditorState,
  type EditorAction,
} from './reducers/editorReducer';
import { useEditorEvents } from './useEditorEvents';

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

const createContentApi = (
  focus: () => void,
  editorRef: React.RefObject<HTMLDivElement>,
  dispatch: React.Dispatch<EditorAction>
) => {
  const updateContent = () => {
    if (editorRef.current) {
      const sanitizedContent = sanitizeHTML(editorRef.current.innerHTML);
      dispatch({ type: 'SET_CONTENT', payload: sanitizedContent });
    }
  };

  return {
    updateContent,
    insertHtml: (html: string, callback?: () => void) => {
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
      if (callback) {
        callback();
      }
    },
  };
};

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

const createWidgetApi = (
  dispatch: React.Dispatch<EditorAction>,
  state: EditorState
) => ({
  setEditingWidget: (widget: HTMLElement | null) =>
    dispatch({ type: 'SET_EDITING_WIDGET', payload: widget }),
  getEditingWidget: () => state.editingWidget,
});

const createEditorApi = (
  editorRef: React.RefObject<HTMLDivElement>,
  dispatch: React.Dispatch<EditorAction>,
  state: EditorState,
  note: Note,
  settings: AppSettings,
  onSave: (note: Note) => void,
  onDelete: (id: string) => void,
  plugins: EditorPlugin[]
): EditorApi => {
  const focus = () => editorRef.current?.focus();

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
    editorRef,
    ...createCommandApi(focus),
    ...createContentApi(focus, editorRef, dispatch),
    ...createNoteApi(note, state, onSave, onDelete),
    ...createWidgetApi(dispatch, state),
    getSettings: () => settings,
    getSelectionParent: Commands.getSelectionParent,
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
    editingWidget: null,
  };

  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Auto-save content changes with debounce
  useEffect(() => {
    // Prevent saving on initial mount or if content is unchanged
    if (state.content === note.content) {
      return;
    }
    const handler = setTimeout(() => {
      onSave({
        ...note,
        content: state.content,
        updatedAt: new Date().toISOString(),
      });
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [state.content, note, onSave]);

  const editorApi: EditorApi = useMemo(
    () =>
      createEditorApi(
        editorRef,
        dispatch,
        state,
        note,
        settings,
        onSave,
        onDelete,
        plugins
      ),
    [dispatch, state, note, settings, onSave, onDelete, plugins]
  );

  const { handleInput, handleClick, handleKeyDown } = useEditorEvents(
    plugins,
    editorApi,
    state,
    dispatch
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

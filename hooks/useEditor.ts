import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { EditorApi, EditorPlugin } from '../types/editor';
import { sanitizeHTML } from '../utils/sanitize';
import * as Commands from '../utils/editorCommands';
import { AppSettings, Note } from '../types';

// --- State Management with useReducer ---

interface EditorState {
  content: string;
  editingWidget: HTMLElement | null;
}

type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_EDITING_WIDGET'; payload: HTMLElement | null };

const editorReducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
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
  onDelete: (id: string) => void,
  plugins: EditorPlugin[]
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

  const insertHtml = (html: string, callback?: () => void) => {
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

  const pluginApis = plugins.reduce((acc, plugin) => {
    if (plugin.api) {
      acc[plugin.id] = plugin.api;
    }
    return acc;
  }, {} as { [pluginId: string]: unknown });

  return {
    editorRef,
    execCommand,
    toggleBlock,
    queryCommandState: Commands.queryCommandState,
    getSelectionParent: Commands.getSelectionParent,
    insertHtml,
    getNote: () => note,
    getSettings: () => settings,
    setEditingWidget: (widget) =>
      dispatch({ type: 'SET_EDITING_WIDGET', payload: widget }),
    getEditingWidget: () => state.editingWidget,
    updateContent,
    updateNote,
    deleteNote: () => onDelete(note.id),
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
    }, 1000); // 1-second debounce

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
      // If a widget is being edited, prevent typing in the main editor.
      // Allow navigation keys for accessibility.
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

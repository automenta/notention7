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
import { parseHTML } from '../utils/contentModel';

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

import { parseHTML } from '../utils/contentModel';

const createContentApi = (
  state: EditorState,
  dispatch: React.Dispatch<EditorAction>
) => {
  return {
    insertHtml: (html: string) => {
      const newNodes = parseHTML(html);
      if (newNodes.length === 0) return;

      // This is a simplified insertion logic. It appends the new nodes to the end.
      // A proper implementation would need to determine the cursor position within
      // the content model and insert the nodes there.
      const newModel = [...state.contentModel, ...newNodes];

      dispatch({ type: 'SET_CONTENT_MODEL', payload: newModel });
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
    ...createContentApi(state, dispatch),
    ...createNoteApi(note, state, onSave, onDelete),
    ...createWidgetApi(dispatch, state),
    getSettings: () => settings,
    getSelectionParent: Commands.getSelectionParent,
    syncViewToModel: () => {
      if (editorRef.current) {
        const sanitizedContent = sanitizeHTML(editorRef.current.innerHTML);
        dispatch({ type: 'SET_CONTENT', payload: sanitizedContent });
      }
    },
    updateWidget: (
      widgetId: string,
      data: Partial<import('../types').PropertyWidgetNode>
    ) => {
      const newModel = state.contentModel.map((node) => {
        if (node.type === 'widget' && node.id === widgetId) {
          return { ...node, ...data };
        }
        return node;
      });
      dispatch({ type: 'SET_CONTENT_MODEL', payload: newModel });
    },
    deleteWidget: (widgetId: string) => {
      const newModel = state.contentModel.filter(
        (node) => !(node.type === 'widget' && node.id === widgetId)
      );
      dispatch({ type: 'SET_CONTENT_MODEL', payload: newModel });
    },
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
    editingWidget: null,
    pendingWidgetEdit: null,
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
    pendingWidgetEdit: state.pendingWidgetEdit,
  };
};

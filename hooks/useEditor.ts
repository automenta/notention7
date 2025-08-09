import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { sanitizeHTML } from '../utils/sanitize';
import * as Commands from '../utils/editorCommands';
import type {
  AppSettings,
  ContentNode,
  EditorApi,
  EditorPlugin,
  Note,
} from '@/types';
import {
  type EditorAction,
  editorReducer,
  type EditorState,
} from './reducers/editorReducer';
import { useEditorEvents } from './useEditorEvents';
import { parseHTML, serializeToHTML } from '../utils/contentModel';
import { getCursorPosition, setCursorPosition } from '../utils/selection';

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

const findModelPosition = (model: ContentNode[], charPosition: number) => {
  let currentCharCount = 0;
  for (let i = 0; i < model.length; i++) {
    const node = model[i];
    if (node.type === 'text') {
      const nodeLength = node.content.length;
      if (currentCharCount + nodeLength >= charPosition) {
        return { index: i, offset: charPosition - currentCharCount };
      }
      currentCharCount += nodeLength;
    } else if (node.type === 'widget') {
      // Widgets are treated as a single character
      if (currentCharCount + 1 >= charPosition) {
        return { index: i, offset: charPosition - currentCharCount };
      }
      currentCharCount += 1;
    }
  }
  return { index: model.length, offset: 0 }; // Default to the end
};

const createContentApi = (
  state: EditorState,
  dispatch: React.Dispatch<EditorAction>,
  editorRef: React.RefObject<HTMLDivElement>
) => {
  return {
    insertHtml: (html: string) => {
      if (!editorRef.current) return;

      const newNodes = parseHTML(html);
      if (newNodes.length === 0) return;

      // 1. Get cursor position from the DOM
      const charPosition = getCursorPosition(editorRef.current);

      // 2. Find where that position maps to in our content model
      const { index: modelIndex, offset: modelOffset } = findModelPosition(
        state.contentModel,
        charPosition
      );

      // 3. Split the target node if inserting in the middle of a text node
      const targetNode = state.contentModel[modelIndex];
      let newModel = [...state.contentModel];

      if (
        targetNode?.type === 'text' &&
        modelOffset > 0 &&
        modelOffset < targetNode.content.length
      ) {
        const before = {
          ...targetNode,
          content: targetNode.content.substring(0, modelOffset),
        };
        const after = {
          ...targetNode,
          content: targetNode.content.substring(modelOffset),
        };
        newModel.splice(modelIndex, 1, before, ...newNodes, after);
      } else {
        newModel.splice(modelIndex, 0, ...newNodes);
      }

      // 4. Dispatch the updated model and calculate next cursor position
      const newContent = serializeToHTML(newModel);
      const nextCursorPos =
        charPosition +
        newNodes.reduce(
          (len, node) => len + (node.type === 'text' ? node.content.length : 1),
          0
        );

      dispatch({
        type: 'SET_CONTENT_AND_MODEL',
        payload: {
          content: newContent,
          contentModel: newModel,
          nextCursorPosition: nextCursorPos,
        },
      });
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
    ...createContentApi(state, dispatch, editorRef),
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
    nextCursorPosition: null,
  };

  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Auto-save content changes with debounce
  useEffect(() => {
    // Prevent saving on initial mount or if content is unchanged
    if (state.content === note.content) {
      return;
    }
    const handler = setTimeout(() => {
      // Derive tags and properties from the content model
      const newTags: string[] = [];
      const newProperties: Note['properties'] = [];
      state.contentModel.forEach((node) => {
        if (node.type === 'widget') {
          if (node.kind === 'tag') {
            newTags.push(node.tag);
          } else if (node.kind === 'property') {
            newProperties.push({
              key: node.key,
              op: node.operator,
              values: node.values as string[], // Assuming values are strings for now
            });
          }
        }
      });

      onSave({
        ...note,
        content: state.content,
        tags: newTags,
        properties: newProperties,
        updatedAt: new Date().toISOString(),
      });
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [state.content, state.contentModel, note, onSave]);

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

  // Effect to restore cursor position after programmatic content changes
  useEffect(() => {
    if (state.nextCursorPosition !== null && editorRef.current) {
      setCursorPosition(editorRef.current, state.nextCursorPosition);
      // Reset the cursor position so this effect doesn't run again unintentionally
      dispatch({ type: 'RESET_CURSOR_POSITION' });
    }
    // This effect should ONLY run when nextCursorPosition changes.
  }, [state.nextCursorPosition, dispatch]);

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

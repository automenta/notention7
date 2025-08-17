import React, { useEffect, useMemo, useReducer, useRef } from 'react';
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
import { setCursorPosition } from '../utils/selection';
import { useAutoSave } from './useAutoSave';
import { createEditorApi } from './api/editorApi';

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

  useAutoSave(note, state.content, state.contentModel, onSave);

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

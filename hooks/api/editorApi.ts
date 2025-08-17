import React from 'react';
import * as Commands from '../../utils/editorCommands';
import type {
  AppSettings,
  EditorApi,
  EditorPlugin,
  Note,
} from '@/types';
import {
  type EditorAction,
  type EditorState,
} from '../reducers/editorReducer';
import { parseHTML, serializeToHTML } from '../../utils/contentModel';
import { getCursorPosition } from '../../utils/selection';
import { sanitizeHTML } from '../../utils/sanitize';
import { findModelPosition } from '../../utils/editor';

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
  state: EditorState,
  dispatch: React.Dispatch<EditorAction>,
  editorRef: React.RefObject<HTMLDivElement>
) => {
  return {
    insertHtml: (html: string) => {
      if (!editorRef.current) return;

      const newNodes = parseHTML(html);
      if (newNodes.length === 0) return;

      const charPosition = getCursorPosition(editorRef.current);
      const { index: modelIndex, offset: modelOffset } = findModelPosition(
        state.contentModel,
        charPosition
      );

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

export const createEditorApi = (
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
      data: Partial<import('../../types').PropertyWidgetNode>
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

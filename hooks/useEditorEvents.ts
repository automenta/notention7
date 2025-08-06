import React, { useCallback } from 'react';
import type { EditorApi, EditorPlugin } from '../types';
import { sanitizeHTML } from '../utils/sanitize';
import type { EditorAction, EditorState } from './reducers/editorReducer';

export const useEditorEvents = (
  plugins: EditorPlugin[],
  editorApi: EditorApi,
  state: EditorState,
  dispatch: React.Dispatch<EditorAction>
) => {
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

  return { handleInput, handleClick, handleKeyDown };
};

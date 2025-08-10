import type { ContentNode } from '@/types';
import { parseHTML } from '@/utils/contentModel';

export interface EditorState {
  contentModel: ContentNode[];
  editingWidget: HTMLElement | null;
  pendingWidgetEdit: string | null;
  nextCursorPosition: number | null;
}

export type EditorAction =
  | {
      type: 'SET_MODEL_FROM_HTML';
      payload: string;
    }
  | {
      type: 'SET_MODEL_AND_CURSOR';
      payload: {
        contentModel: ContentNode[];
        nextCursorPosition: number;
      };
    }
  | { type: 'SET_CONTENT_MODEL'; payload: ContentNode[] }
  | { type: 'SET_EDITING_WIDGET'; payload: HTMLElement | null }
  | { type: 'SCHEDULE_WIDGET_EDIT'; payload: string | null }
  | { type: 'RESET_CURSOR_POSITION' };

export const editorReducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SET_MODEL_FROM_HTML': {
      const contentModel = parseHTML(action.payload);
      // This action will now be used to sync the model from the view
      return { ...state, contentModel, nextCursorPosition: null };
    }
    case 'SET_MODEL_AND_CURSOR':
      return {
        ...state,
        contentModel: action.payload.contentModel,
        nextCursorPosition: action.payload.nextCursorPosition,
      };
    case 'SET_CONTENT_MODEL': {
      // No longer serializes to HTML, just sets the model
      return { ...state, contentModel: action.payload, nextCursorPosition: null };
    }
    case 'SET_EDITING_WIDGET':
      return {
        ...state,
        editingWidget: action.payload,
        pendingWidgetEdit: null,
        nextCursorPosition: null,
      };
    case 'SCHEDULE_WIDGET_EDIT':
      return { ...state, pendingWidgetEdit: action.payload, nextCursorPosition: null };
    case 'RESET_CURSOR_POSITION':
      return { ...state, nextCursorPosition: null };
    default:
      return state;
  }
};

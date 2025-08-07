import { ContentNode } from '../../types';
import { parseHTML, serializeToHTML } from '../../utils/contentModel';

import { ContentNode } from '../../types';
import { parseHTML, serializeToHTML } from '../../utils/contentModel';

export interface EditorState {
  content: string;
  contentModel: ContentNode[];
  editingWidget: HTMLElement | null;
  pendingWidgetEdit: string | null;
}

export type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_CONTENT_MODEL'; payload: ContentNode[] }
  | { type: 'SET_EDITING_WIDGET'; payload: HTMLElement | null }
  | { type: 'SCHEDULE_WIDGET_EDIT'; payload: string | null };

export const editorReducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SET_CONTENT': {
      const contentModel = parseHTML(action.payload);
      return { ...state, content: action.payload, contentModel };
    }
    case 'SET_CONTENT_MODEL': {
      const content = serializeToHTML(action.payload);
      return { ...state, content, contentModel: action.payload };
    }
    case 'SET_EDITING_WIDGET':
      return { ...state, editingWidget: action.payload, pendingWidgetEdit: null };
    case 'SCHEDULE_WIDGET_EDIT':
      return { ...state, pendingWidgetEdit: action.payload };
    default:
      return state;
  }
};

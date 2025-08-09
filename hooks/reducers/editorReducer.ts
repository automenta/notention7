import {ContentNode} from '@/types';
import {parseHTML, serializeToHTML} from '@/utils/contentModel.ts';

export interface EditorState {
    content: string;
    contentModel: ContentNode[];
    editingWidget: HTMLElement | null;
    pendingWidgetEdit: string | null;
    nextCursorPosition: number | null;
}

export type EditorAction =
    | { type: 'SET_CONTENT'; payload: string }
    | {
    type: 'SET_CONTENT_AND_MODEL';
    payload: {
        content: string;
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
        case 'SET_CONTENT': {
            const contentModel = parseHTML(action.payload);
            return {...state, content: action.payload, contentModel, nextCursorPosition: null};
        }
        case 'SET_CONTENT_AND_MODEL':
            return {
                ...state,
                content: action.payload.content,
                contentModel: action.payload.contentModel,
                nextCursorPosition: action.payload.nextCursorPosition,
            };
        case 'SET_CONTENT_MODEL': {
            const content = serializeToHTML(action.payload);
            return {...state, content, contentModel: action.payload, nextCursorPosition: null};
        }
        case 'SET_EDITING_WIDGET':
            return {...state, editingWidget: action.payload, pendingWidgetEdit: null, nextCursorPosition: null};
        case 'SCHEDULE_WIDGET_EDIT':
            return {...state, pendingWidgetEdit: action.payload, nextCursorPosition: null};
        case 'RESET_CURSOR_POSITION':
            return {...state, nextCursorPosition: null};
        default:
            return state;
    }
};

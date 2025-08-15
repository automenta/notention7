import { ContentModel, EditorSelection } from '@/types';
import { parseHTML, serializeToHTML } from '@/utils/contentModel';
import { Transaction } from '@/utils/transaction';

export interface EditorState {
    content: string;
    contentModel: ContentModel;
    selection: EditorSelection | null;
    editingWidget: HTMLElement | null;
    pendingWidgetEdit: string | null;
}

export type EditorAction =
    // The primary way to update the document state
    | { type: 'APPLY_TRANSACTION'; payload: Transaction }
    // Used for syncing external changes (e.g., from raw HTML input)
    | { type: 'SET_CONTENT_EXTERNALLY'; payload: string }
    // UI-specific state changes
    | { type: 'SET_SELECTION'; payload: EditorSelection | null }
    | { type: 'SET_EDITING_WIDGET'; payload: HTMLElement | null }
    | { type: 'SCHEDULE_WIDGET_EDIT'; payload: string | null };

export const editorReducer = (
    state: EditorState,
    action: EditorAction
): EditorState => {
    switch (action.type) {
        case 'APPLY_TRANSACTION': {
            const { newDoc, newSelection } = action.payload.apply();
            const newContent = serializeToHTML(newDoc);
            return {
                ...state,
                content: newContent,
                contentModel: newDoc,
                selection: newSelection ?? state.selection,
            };
        }

        case 'SET_CONTENT_EXTERNALLY': {
            const contentModel = parseHTML(action.payload);
            return {
                ...state,
                content: action.payload,
                contentModel,
                selection: null, // Reset selection on external change
            };
        }

        case 'SET_SELECTION': {
            return { ...state, selection: action.payload };
        }

        case 'SET_EDITING_WIDGET':
            return { ...state, editingWidget: action.payload, pendingWidgetEdit: null };

        case 'SCHEDULE_WIDGET_EDIT':
            return { ...state, pendingWidgetEdit: action.payload };

        default:
            return state;
    }
};

import {EditorPlugin} from '@/types/editor.ts';
import {RichTextEditorV2} from '../RichTextEditorV2';
import {TextareaEditor} from '../TextareaEditor';

export const editorPlugins: EditorPlugin[] = [
    {
        id: 'rich-text',
        name: 'Rich Text Editor',
        component: RichTextEditorV2,
    },
    {
        id: 'textarea',
        name: 'Plain Text Editor',
        component: TextareaEditor,
    },
];

import {EditorPlugin} from '@/types/editor.ts';
import {RichTextEditor} from '../RichTextEditor';
import {TextareaEditor} from '../TextareaEditor';

export const editorPlugins: EditorPlugin[] = [
    {
        id: 'rich-text',
        name: 'Rich Text Editor',
        component: RichTextEditor,
    },
    {
        id: 'textarea',
        name: 'Plain Text Editor',
        component: TextareaEditor,
    },
];

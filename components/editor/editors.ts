import type {AvailableEditor} from '@/types';
import {RichTextEditorV2} from '../RichTextEditorV2';
import {TextareaEditor} from '../TextareaEditor';

export const availableEditors: AvailableEditor[] = [
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

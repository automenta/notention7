import type {EditorPlugin} from '@/types';
import {EditorHeaderComponent} from './EditorHeaderPlugin';

export const editorHeaderPlugin: EditorPlugin = {
    id: 'editor-header',
    name: 'Editor Header',
    HeaderComponent: EditorHeaderComponent,
};

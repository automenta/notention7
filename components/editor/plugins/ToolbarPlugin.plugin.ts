import type {EditorPlugin} from '@/types';
import {ToolbarComponent} from './ToolbarPlugin';

export const toolbarPlugin: EditorPlugin = {
    id: 'toolbar',
    name: 'Toolbar',
    ToolbarComponent: ToolbarComponent,
};

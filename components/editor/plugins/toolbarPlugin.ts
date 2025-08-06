import { EditorPlugin } from '../../../types/editor';
import { ToolbarComponent } from './ToolbarPlugin.tsx';

export const toolbarPlugin: EditorPlugin = {
  id: 'toolbar',
  name: 'Toolbar',
  ToolbarComponent: ToolbarComponent,
};

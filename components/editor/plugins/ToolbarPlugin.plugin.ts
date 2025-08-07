import type { EditorPlugin } from '../../../types';
import { Toolbar } from './ToolbarPlugin';

export const toolbarPlugin: EditorPlugin = {
  id: 'toolbar',
  name: 'Toolbar',
  ToolbarComponent: Toolbar,
};

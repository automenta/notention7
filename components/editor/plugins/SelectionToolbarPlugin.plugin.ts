import type { EditorPlugin } from '../../../types';
import { SelectionToolbar } from './SelectionToolbarPlugin';

export const selectionToolbarPlugin: EditorPlugin = {
  id: 'selection-toolbar',
  name: 'Selection Toolbar',
  ToolbarComponent: SelectionToolbar,
};

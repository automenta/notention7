import type { EditorPlugin } from '../../../types';
import { EditorHeader } from './EditorHeaderPlugin';

export const editorHeaderPlugin: EditorPlugin = {
  id: 'editor-header',
  name: 'Editor Header',
  HeaderComponent: EditorHeader,
};

import type { EditorPlugin } from '../../../types';
import { AIActionComponent } from './AIActionPlugin';

export const aiActionPlugin: EditorPlugin = {
  id: 'ai-action',
  name: 'AI Action',
  headerComponent: AIActionComponent,
};

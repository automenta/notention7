import type { EditorPlugin } from '@/types';
import { AIActionMenu } from './AIActionMenu';

export const aiActionPlugin: EditorPlugin = {
  id: 'ai-action',
  name: 'AI Action',
  HeaderComponent: AIActionMenu,
};

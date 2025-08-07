import type { EditorPlugin } from '../../../types';
import { InsertMenuProvider } from './InsertMenuPlugin';
import { api } from './insertMenuApi';

export const insertMenuPlugin: EditorPlugin = {
  id: 'insert-menu',
  name: 'Insert Menu',
  Popover: InsertMenuProvider,
  api: api,
};

import type { EditorPlugin } from '../../../types';
import {
  api,
  InsertMenuProvider,
} from './InsertMenuPlugin';

export const insertMenuPlugin: EditorPlugin = {
  id: 'insert-menu',
  name: 'Insert Menu',
  Popover: InsertMenuProvider,
  api: api,
};

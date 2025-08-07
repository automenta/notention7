import type { EditorPlugin } from '../../../types';
import {
  SemanticInsertModalProvider,
  SemanticInsertToolbar,
} from './SemanticInsertPlugin';

export const semanticInsertPlugin: EditorPlugin = {
  id: 'semantic-insert',
  name: 'Semantic Insert',
  ToolbarComponent: SemanticInsertToolbar,
  Popover: SemanticInsertModalProvider,
};

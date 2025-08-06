import { EditorPlugin } from '../../../types/editor';
import {
  SemanticInsertToolbar,
  SemanticInsertModalProvider,
} from './SemanticInsertPlugin';

export const semanticInsertPlugin: EditorPlugin = {
  id: 'semantic-insert',
  name: 'Semantic Insert',
  ToolbarComponent: SemanticInsertToolbar,
  Modal: SemanticInsertModalProvider,
};

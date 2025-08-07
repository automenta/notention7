import type { EditorPlugin } from '../../../types';
import {
  handleSemanticInsert,
  SemanticsProvider,
} from './SemanticInsertPlugin';

export const semanticInsertPlugin: EditorPlugin = {
  id: 'semantic-insert',
  name: 'Semantic Insert',
  onInput: handleSemanticInsert,
  Popover: SemanticsProvider,
};

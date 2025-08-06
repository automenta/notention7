import type { EditorPlugin } from '../../types';
import { toolbarPlugin } from './plugins/ToolbarPlugin';
import { semanticInsertPlugin } from './plugins/SemanticInsertPlugin';
import { propertyEditorPlugin } from './plugins/PropertyEditorPlugin';
import { inputRulesPlugin } from './plugins/inputRulesPlugin';
import { editorHeaderPlugin } from './plugins/EditorHeaderPlugin';
import { insertMenuPlugin } from './plugins/InsertMenuPlugin';
import { selectionToolbarPlugin } from './plugins/SelectionToolbarPlugin';

export const editorPlugins: EditorPlugin[] = [
  editorHeaderPlugin,
  toolbarPlugin,
  semanticInsertPlugin,
  propertyEditorPlugin,
  inputRulesPlugin,
  insertMenuPlugin,
  selectionToolbarPlugin,
];

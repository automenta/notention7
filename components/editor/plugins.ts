import type { EditorPlugin } from '../../types';
import { toolbarPlugin } from './plugins/ToolbarPlugin.plugin';
import { semanticInsertPlugin } from './plugins/SemanticInsertPlugin.plugin';
import { propertyEditorPlugin } from './plugins/PropertyEditorPlugin.plugin';
import { inputRulesPlugin } from './plugins/inputRulesPlugin';
import { editorHeaderPlugin } from './plugins/EditorHeaderPlugin.plugin';
import { insertMenuPlugin } from './plugins/InsertMenuPlugin.plugin';
import { selectionToolbarPlugin } from './plugins/SelectionToolbarPlugin.plugin';
import { aiActionPlugin } from './plugins/AIActionPlugin.plugin';

export const editorPlugins: EditorPlugin[] = [
  editorHeaderPlugin,
  toolbarPlugin,
  semanticInsertPlugin,
  propertyEditorPlugin,
  inputRulesPlugin,
  insertMenuPlugin,
  selectionToolbarPlugin,
  aiActionPlugin,
];

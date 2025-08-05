import { EditorPlugin } from "../../../types/editor";
import { EditorHeaderComponent } from "./EditorHeaderPlugin";

export const editorHeaderPlugin: EditorPlugin = {
    id: 'editor-header',
    name: 'Editor Header',
    HeaderComponent: EditorHeaderComponent,
};

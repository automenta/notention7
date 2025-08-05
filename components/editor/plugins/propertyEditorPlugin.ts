import { EditorPlugin } from "../../../types/editor";
import { handleWidgetClick, PropertyEditor } from "./PropertyEditorPlugin";

export const propertyEditorPlugin: EditorPlugin = {
    id: 'property-editor',
    name: 'Property Editor',
    onClick: handleWidgetClick,
    Popover: PropertyEditor,
};

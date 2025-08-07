import type { EditorApi } from '../../../types';

// This function will be the `onClick` handler provided by the plugin.
export const handleWidgetClick = (
  event: React.MouseEvent<HTMLDivElement>,
  editorApi: EditorApi
) => {
  const target = event.target as HTMLElement;
  const widget = target.closest<HTMLElement>('.widget.property');
  const currentlyEditing = editorApi.getEditingWidget();

  if (widget) {
    event.preventDefault();
    event.stopPropagation();
    if (currentlyEditing !== widget) {
      if (!widget.id) {
        widget.id = `widget-${crypto.randomUUID()}`;
      }
      editorApi.setEditingWidget(widget);
    }
    return true; // Event handled
  } else if (currentlyEditing) {
    editorApi.setEditingWidget(null);
  }
};

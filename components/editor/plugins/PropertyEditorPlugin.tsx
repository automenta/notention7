import React from 'react';
import { EditorApi } from '../../../types/editor';
import { PropertyEditorPopover } from '../../editor/PropertyEditorPopover';
import { useOntologyIndex } from '../../../hooks/useOntologyIndex';
import { formatPropertyForDisplay } from '../../../utils/properties';

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

export const PropertyEditor: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  const settings = editorApi.getSettings();
  const { propertyTypes } = useOntologyIndex(settings.ontology);
  const editingWidget = editorApi.getEditingWidget();

  if (!editingWidget) {
    return null;
  }

  const handleSave = (
    widgetId: string,
    key: string,
    operator: string,
    values: string[]
  ) => {
    const editor = editorApi.editorRef.current;
    const widget = editor?.querySelector<HTMLElement>(`#${widgetId}`);
    if (widget) {
      widget.dataset.key = key;
      widget.dataset.operator = operator;
      widget.dataset.values = JSON.stringify(values);
      widget.innerHTML = formatPropertyForDisplay(key, operator, values);
      editorApi.updateContent();
    }
    editorApi.setEditingWidget(null);
  };

  const handleDelete = (widgetId: string) => {
    const editor = editorApi.editorRef.current;
    const widget = editor?.querySelector(`#${widgetId}`);
    if (widget) {
      widget.remove();
      editorApi.updateContent();
    }
    editorApi.setEditingWidget(null);
  };

  return (
    <PropertyEditorPopover
      widgetEl={editingWidget}
      onSave={handleSave}
      onDelete={handleDelete}
      onClose={() => editorApi.setEditingWidget(null)}
      propertyTypes={propertyTypes}
    />
  );
};

import React from 'react';
import ReactDOM from 'react-dom';
import { PropertyEditor as PropertyEditorForm } from '../PropertyEditor';
import { useOntologyIndex } from '../../../hooks/useOntologyIndex';
import { formatPropertyForDisplay } from '../../../utils/properties';
import type { EditorApi, Property } from '../../../types';

export const PropertyEditorPopover: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  const settings = editorApi.getSettings();
  const { propertyTypes } = useOntologyIndex(settings.ontology);
  const editingWidget = editorApi.getEditingWidget();

  if (!editingWidget) {
    return null;
  }

  // The new editor is not a popover, so we need to render it in a portal
  // and position it correctly. For now, let's just render it in a portal.
  // We can refine positioning later. This is a big simplification from the
  // old popover's internal logic.
  const rect = editingWidget.getBoundingClientRect();
  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    zIndex: 50,
  };

  const initialProperty: Property = {
    key: editingWidget.dataset.key || '',
    operator: editingWidget.dataset.operator || 'is',
    values: JSON.parse(editingWidget.dataset.values || '[""]'),
  };

  const handleSave = (property: Property) => {
    const { key, operator, values } = property;
    // Update the dataset of the widget node. The MutationObserver in
    // WidgetRenderer will detect the change and trigger a re-render of the portal.
    editingWidget.dataset.key = key;
    editingWidget.dataset.operator = operator;
    editingWidget.dataset.values = JSON.stringify(values);

    editorApi.updateContent();
    editorApi.setEditingWidget(null);
  };

  const handleDelete = () => {
    editingWidget.remove();
    editorApi.updateContent();
    editorApi.setEditingWidget(null);
  };

  return ReactDOM.createPortal(
    <div style={popoverStyle}>
      <PropertyEditorForm
        property={initialProperty}
        propertyTypes={propertyTypes}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={() => editorApi.setEditingWidget(null)}
      />
    </div>,
    document.body
  );
};

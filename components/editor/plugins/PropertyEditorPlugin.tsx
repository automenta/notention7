import React from 'react';
import ReactDOM from 'react-dom';
import { PropertyEditor as PropertyEditorForm } from '../PropertyEditor';
import { useOntologyIndex } from '@/hooks/useOntologyIndex.ts';
import type { EditorApi, Property, PropertyWidgetNode } from '@/types';

export const PropertyEditorPopover: React.FC<{ editorApi: EditorApi }> = ({
  editorApi,
}) => {
  const settings = editorApi.getSettings();
  const { propertyTypes } = useOntologyIndex(settings.ontology);
  const editingWidgetElement = editorApi.getEditingWidget();

  if (!editingWidgetElement) {
    return null;
  }

  const model = editorApi.getContentModel();
  const widgetNode = model.find(
    (node) => node.type === 'widget' && node.id === editingWidgetElement.id
  ) as PropertyWidgetNode | undefined;

  if (!widgetNode) {
    // If the node isn't in the model, we can't edit it. Close the editor.
    editorApi.setEditingWidget(null);
    return null;
  }

  const initialProperty: Property = {
    key: widgetNode.key,
    operator: widgetNode.operator,
    values: widgetNode.values,
  };

  const handleSave = (property: Property) => {
    if (!editingWidgetElement?.id) return;
    const { key, operator, values } = property;
    editorApi.updateWidget(editingWidgetElement.id, { key, operator, values });
    editorApi.setEditingWidget(null);
  };

  const handleDelete = () => {
    if (!editingWidgetElement?.id) return;
    editorApi.deleteWidget(editingWidgetElement.id);
    editorApi.setEditingWidget(null);
  };

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const rect = editingWidgetElement.getBoundingClientRect();

    const popoverStyle: React.CSSProperties = isMobile
        ? {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
        }
        : {
            position: 'fixed',
            top: `${rect.bottom + 8}px`,
            left: `${rect.left}px`,
            zIndex: 50,
        };

    const portalContent = (
        <div style={popoverStyle}>
            <PropertyEditorForm
                property={initialProperty}
                propertyTypes={propertyTypes}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={() => editorApi.setEditingWidget(null)}
            />
        </div>
    );

    return ReactDOM.createPortal(
        isMobile ? (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
                onClick={() => editorApi.setEditingWidget(null)}
            >
                {portalContent}
            </div>
        ) : (
            portalContent
        ),
        document.body
    );
};

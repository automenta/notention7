import React from 'react';
import ReactDOM from 'react-dom';
import {PropertyEditor as PropertyEditorForm} from '../PropertyEditor';
import {useOntologyIndex} from '@/hooks/useOntologyIndex.ts';
import type {EditorApi, Property} from '@/types';

export const PropertyEditorPopover: React.FC<{ editorApi: EditorApi }> = ({
                                                                              editorApi,
                                                                          }) => {
    const settings = editorApi.getSettings();
    const {propertyTypes} = useOntologyIndex(settings.ontology);
    const editingWidget = editorApi.getEditingWidget();

    if (!editingWidget) {
        return null;
    }

    const initialProperty: Property = {
        key: editingWidget.dataset.key || '',
        operator: editingWidget.dataset.operator || 'is',
        values: JSON.parse(editingWidget.dataset.values || '[""]'),
    };

    const handleSave = (property: Property) => {
        if (!editingWidget?.id) return;
        const {key, operator, values} = property;
        editorApi.updateWidget(editingWidget.id, {key, operator, values});
        editorApi.setEditingWidget(null);
    };

    const handleDelete = () => {
        if (!editingWidget?.id) return;
        editorApi.deleteWidget(editingWidget.id);
        editorApi.setEditingWidget(null);
    };

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const rect = editingWidget.getBoundingClientRect();

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

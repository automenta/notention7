import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import WidgetRenderer from '@/components/editor/widgets/WidgetRenderer';
import {getNoteSemantics} from '@/utils/noteSemantics';
import type {EditorApi, Property} from '@/types';

// SemanticWidget is the component being portal-rendered. We don't need to mock it.
// We can just check for its output.

const mockSetEditingWidget = vi.fn();

const createMockEditorApi = (editorDiv: HTMLDivElement): Partial<EditorApi> => {
    return {
        editorRef: {current: editorDiv},
        setEditingWidget: mockSetEditingWidget,
    };
};

describe('WidgetRenderer', () => {
    let mockEditorApi: Partial<EditorApi>;
    let editorContainer: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        editorContainer = document.createElement('div');
        document.body.appendChild(editorContainer);
        mockEditorApi = createMockEditorApi(editorContainer);
    });

    afterEach(() => {
        document.body.removeChild(editorContainer);
    });

    it('should not render anything if no widgets are in the editor', () => {
        const {container} = render(
            <WidgetRenderer editorApi={mockEditorApi as EditorApi}/>
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render a portal for a widget that exists on initial render', async () => {
        editorContainer.innerHTML = `<span class="widget property" data-key="test" data-operator="is" data-values='["value"]'></span>`;

        render(<WidgetRenderer editorApi={mockEditorApi as EditorApi}/>);

        await waitFor(() => {
            // The text content comes from the SemanticWidget component
            const renderedWidget = screen.getByText('test is value');
            expect(renderedWidget).toBeInTheDocument();
            // Check that it's inside the original node
            const placeholder = editorContainer.querySelector('.widget.property');
            expect(placeholder).toContainElement(renderedWidget);
        });
    });

    it('should render a portal for a widget added after initial render', async () => {
        render(<WidgetRenderer editorApi={mockEditorApi as EditorApi}/>);

        // Widget doesn't exist yet
        expect(
            screen.queryByText('another is test')
        ).not.toBeInTheDocument();

        // Now, add the widget to the DOM, which should be detected by the MutationObserver
        const widgetNode = document.createElement('span');
        widgetNode.className = 'widget property';
        widgetNode.dataset.key = 'another';
        widgetNode.dataset.operator = 'is';
        widgetNode.dataset.values = '["test"]';
        editorContainer.appendChild(widgetNode);

        await waitFor(() => {
            const renderedWidget = screen.getByText('another is test');
            expect(renderedWidget).toBeInTheDocument();
            expect(editorContainer.querySelector('span')).toContainElement(
                renderedWidget
            );
        });
    });

    it('should unmount cleanly without errors when a widget is present', () => {
        editorContainer.innerHTML = `<span class="widget property" data-key="test" data-operator="is" data-values='["value"]'></span>`;

        const {unmount} = render(
            <WidgetRenderer editorApi={mockEditorApi as EditorApi}/>
        );

        // The component is now rendered. Now, let's unmount it and see if it throws.
        // We expect it to unmount without throwing the NotFoundError.
        expect(() => unmount()).not.toThrow();
    });

    it('should handle the full lifecycle of insertion, editing, and persistence', async () => {
        // 1. Initial state: editor is empty
        render(<WidgetRenderer editorApi={mockEditorApi as EditorApi}/>);

        // 2. Insert a "template" (two properties)
        editorContainer.innerHTML = `
      <p>
        Some text before.
        <span id="widget1" class="widget property" data-key="status" data-operator="is" data-values='["new"]'></span>
        <span id="widget2" class="widget property" data-key="priority" data-operator="is" data-values='["low"]'></span>
        Some text after.
      </p>
    `;

        // 3. Verify the widgets are rendered by the portal system
        await waitFor(() => {
            expect(screen.getByText('status is new')).toBeInTheDocument();
            expect(screen.getByText('priority is low')).toBeInTheDocument();
        });

        // 4. Simulate editing the first widget
        const widgetToEdit = editorContainer.querySelector('#widget1') as HTMLElement;

        // This simulates the PropertyEditorPlugin's handleSave function
        const updatedProperty: Property = {key: 'status', operator: 'is', values: ['in-progress']};
        widgetToEdit.dataset.key = updatedProperty.key;
        widgetToEdit.dataset.operator = updatedProperty.operator;
        widgetToEdit.dataset.values = JSON.stringify(updatedProperty.values);

        // 5. Verify the view updates
        await waitFor(() => {
            expect(screen.getByText('status is in-progress')).toBeInTheDocument();
            expect(screen.queryByText('status is new')).not.toBeInTheDocument();
        });

        // 6. Verify persistence by parsing the editor's final HTML state
        const finalHtml = editorContainer.innerHTML;
        const {properties} = getNoteSemantics(finalHtml);

        expect(properties).toHaveLength(2);
        expect(properties).toContainEqual({
            key: 'status',
            operator: 'is',
            values: ['in-progress'],
        });
        expect(properties).toContainEqual({
            key: 'priority',
            operator: 'is',
            values: ['low'],
        });
    });
});

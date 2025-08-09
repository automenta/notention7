import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {PropertyEditorPopover,} from '@/components/editor/plugins/PropertyEditorPlugin.tsx';
import {handleWidgetClick} from '@/components/editor/plugins/propertyEditorUtils.ts';
import {useOntologyIndex} from '@/hooks/useOntologyIndex.ts';

import {createMockEditorApi} from '../../../utils/mocks';

// Mock dependencies
vi.mock('../../../../hooks/useOntologyIndex');
vi.mock('../../../../utils/properties', () => ({
    formatPropertyForDisplay: (key: string, op: string, vals: string[]) =>
        `[${key}:${op}:${vals.join(',')}]`,
}));

describe('PropertyEditorPlugin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the return value for the hook
        (useOntologyIndex as vi.Mock).mockReturnValue({
            propertyTypes: new Map(),
            tagTree: {children: {}},
        });
    });

    describe('handleWidgetClick', () => {
        it('should set editing widget when a property widget is clicked', () => {
            const widget = document.createElement('span');
            widget.className = 'widget property';
            const event = {
                target: widget,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
            } as unknown as React.MouseEvent<HTMLDivElement>;
            const api = createMockEditorApi(null);

            const handled = handleWidgetClick(event, api);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(api.setEditingWidget).toHaveBeenCalledWith(widget);
            expect(widget.id).toMatch(/^widget-/);
            expect(handled).toBe(true);
        });

        it('should clear editing widget when clicking outside while editing', () => {
            const editingWidget = document.createElement('span');
            editingWidget.className = 'widget property';
            const outsideElement = document.createElement('p');
            const event = {
                target: outsideElement,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
            } as unknown as React.MouseEvent<HTMLDivElement>;
            const api = createMockEditorApi(editingWidget);

            handleWidgetClick(event, api);

            expect(api.setEditingWidget).toHaveBeenCalledWith(null);
        });
    });

    describe('PropertyEditorPopover Component', () => {
        it('should render null if no widget is being edited', () => {
            const api = createMockEditorApi(null);
            const {container} = render(<PropertyEditorPopover editorApi={api}/>);
            expect(container.firstChild).toBeNull();
        });

        it('should render PropertyEditorPopover when a widget is being edited', () => {
            const widget = document.createElement('div');
            widget.dataset.key = 'test';
            widget.getBoundingClientRect = vi.fn().mockReturnValue({
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: 0,
                height: 0,
                x: 0,
                y: 0,
            });
            const api = createMockEditorApi(widget);

            render(<PropertyEditorPopover editorApi={api}/>);

            // The popover is complex, so we check for a key element we know it renders, like the "Save" button.
            expect(screen.getByText('Save')).toBeInTheDocument();
        });

        it('handleSave calls editorApi.updateWidget with current data', () => {
            const widget = document.createElement('div');
            widget.id = 'widget-to-save';
            widget.dataset.key = 'test-key';
            widget.dataset.operator = 'contains';
            widget.dataset.values = '["initial"]';
            widget.getBoundingClientRect = vi.fn().mockReturnValue({});
            const api = createMockEditorApi(widget);

            render(<PropertyEditorPopover editorApi={api}/>);

            // Simulate user clicking save without changing anything
            fireEvent.click(screen.getByText('Save'));

            expect(api.updateWidget).toHaveBeenCalledWith('widget-to-save', {
                key: 'test-key',
                operator: 'contains',
                values: ['initial'],
            });
            expect(api.setEditingWidget).toHaveBeenCalledWith(null);
        });

        it('handleDelete calls editorApi.deleteWidget', () => {
            const widget = document.createElement('div');
            widget.id = 'widget-to-delete';
            widget.getBoundingClientRect = vi.fn().mockReturnValue({});
            const api = createMockEditorApi(widget);

            render(<PropertyEditorPopover editorApi={api}/>);

            fireEvent.click(screen.getByTitle('Delete Property'));

            expect(api.deleteWidget).toHaveBeenCalledWith('widget-to-delete');
            expect(api.setEditingWidget).toHaveBeenCalledWith(null);
        });
    });
});

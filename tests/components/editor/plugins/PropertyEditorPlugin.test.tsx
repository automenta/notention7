import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PropertyEditorPopover } from '@/components/editor/plugins/PropertyEditorPlugin.tsx';
import { handleWidgetClick } from '@/components/editor/plugins/propertyEditorUtils.ts';
import { useOntologyIndex } from '@/hooks/useOntologyIndex.ts';
import { createMockEditorApi } from '../../../utils/mocks';
import type { EditorApi, PropertyWidgetNode } from '@/types';

// Mock dependencies
vi.mock('@/hooks/useOntologyIndex');

describe('PropertyEditorPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useOntologyIndex as vi.Mock).mockReturnValue({
      propertyTypes: new Map(),
      tagTree: { children: {} },
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
      const { container } = render(<PropertyEditorPopover editorApi={api} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render PropertyEditorPopover when a widget is being edited', () => {
      const widgetElement = document.createElement('div');
      widgetElement.id = 'widget-123';
      widgetElement.getBoundingClientRect = vi.fn().mockReturnValue({});

      const widgetNode: PropertyWidgetNode = {
        type: 'widget', id: 'widget-123', kind: 'property', key: 'test-key', operator: 'is', values: ['test-value']
      };

      const api = createMockEditorApi(widgetElement);
      vi.spyOn(api, 'getContentModel').mockReturnValue([widgetNode]);

      render(<PropertyEditorPopover editorApi={api} />);

      expect(screen.getByDisplayValue('test-key')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-value')).toBeInTheDocument();
    });

    it('handleSave calls editorApi.updateWidget with current data', () => {
      const widgetElement = document.createElement('div');
      widgetElement.id = 'widget-to-save';
      widgetElement.getBoundingClientRect = vi.fn().mockReturnValue({});

      const widgetNode: PropertyWidgetNode = {
        type: 'widget', id: 'widget-to-save', kind: 'property', key: 'test-key', operator: 'contains', values: ['initial']
      };

      const api = createMockEditorApi(widgetElement);
      vi.spyOn(api, 'getContentModel').mockReturnValue([widgetNode]);

      render(<PropertyEditorPopover editorApi={api} />);

      fireEvent.click(screen.getByText('Save'));

      expect(api.updateWidget).toHaveBeenCalledWith('widget-to-save', {
        key: 'test-key',
        operator: 'contains',
        values: ['initial'],
      });
      expect(api.setEditingWidget).toHaveBeenCalledWith(null);
    });

    it('handleDelete calls editorApi.deleteWidget', () => {
      const widgetElement = document.createElement('div');
      widgetElement.id = 'widget-to-delete';
      widgetElement.getBoundingClientRect = vi.fn().mockReturnValue({});

      const widgetNode: PropertyWidgetNode = {
        type: 'widget', id: 'widget-to-delete', kind: 'property', key: 'test-key', operator: 'is', values: ['']
      };

      const api = createMockEditorApi(widgetElement);
      vi.spyOn(api, 'getContentModel').mockReturnValue([widgetNode]);

      render(<PropertyEditorPopover editorApi={api} />);

      fireEvent.click(screen.getByTitle('Delete Property'));

      expect(api.deleteWidget).toHaveBeenCalledWith('widget-to-delete');
      expect(api.setEditingWidget).toHaveBeenCalledWith(null);
    });
  });
});

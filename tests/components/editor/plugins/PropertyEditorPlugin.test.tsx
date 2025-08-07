import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PropertyEditorPopover,
} from '../../../../components/editor/plugins/PropertyEditorPlugin';
import { handleWidgetClick } from '../../../../components/editor/plugins/propertyEditorUtils';
import type { EditorApi } from '../../../../types';
import { useOntologyIndex } from '../../../../hooks/useOntologyIndex';

// Mock dependencies
vi.mock('@/hooks/useOntologyIndex');
vi.mock('@/utils/properties', () => ({
  formatPropertyForDisplay: (key: string, op: string, vals: string[]) =>
    `[${key}:${op}:${vals.join(',')}]`,
}));

const mockSetEditingWidget = vi.fn();
const mockUpdateContent = vi.fn();

const createMockEditorApi = (editingWidget: HTMLElement | null): EditorApi => {
  const editorDiv = document.createElement('div');
  if (editingWidget) {
    editorDiv.appendChild(editingWidget);
  }
  return {
    editorRef: { current: editorDiv },
    execCommand: vi.fn(),
    toggleBlock: vi.fn(),
    queryCommandState: vi.fn(),
    getSelectionParent: vi.fn(),
    insertHtml: vi.fn(),
    getNote: vi.fn(),
    getSettings: vi.fn(() => ({
      aiEnabled: false,
      theme: 'dark',
      nostr: { privkey: null },
      ontology: [],
    })),
    setEditingWidget: mockSetEditingWidget,
    getEditingWidget: () => editingWidget,
    updateContent: mockUpdateContent,
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    plugins: {},
  };
};

describe('PropertyEditorPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the return value for the hook
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
      expect(mockSetEditingWidget).toHaveBeenCalledWith(widget);
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

      expect(mockSetEditingWidget).toHaveBeenCalledWith(null);
    });
  });

  describe('PropertyEditorPopover Component', () => {
    it('should render null if no widget is being edited', () => {
      const api = createMockEditorApi(null);
      const { container } = render(<PropertyEditorPopover editorApi={api} />);
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

      render(<PropertyEditorPopover editorApi={api} />);

      // The popover is complex, so we check for a key element we know it renders, like the "Save" button.
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    // NOTE: Testing the save/delete handlers directly is difficult because they are defined inside the component.
    // A full integration test would be better. However, for now, we can assert on the side effects we can observe.
    it('handleSave updates the widget in the DOM', () => {
      const widget = document.createElement('div');
      widget.id = 'widget-to-save';
      widget.dataset.key = 'old-key';
      widget.dataset.widget = 'semantic-property'; // Test the new widget type
      widget.dataset.values = '["old-value"]';
      widget.innerHTML = 'old';
      widget.getBoundingClientRect = vi.fn().mockReturnValue({});
      const api = createMockEditorApi(widget);

      render(<PropertyEditorPopover editorApi={api} />);

      // To test handleSave, we need to get it from the props of the rendered popover.
      // Since we can't do that easily, we'll simulate the user action that triggers it.
      fireEvent.click(screen.getByText('Save')); // This calls onSave with the current state

      expect(widget.dataset.property).toBe('old-key'); // It saves the initial state
      expect(widget.dataset.operator).toBe('is');
      // When saving an unmodified editor, the original values should be preserved.
      expect(widget.dataset.values).toBe('["old-value"]');
      expect(mockUpdateContent).toHaveBeenCalled();
      expect(mockSetEditingWidget).toHaveBeenCalledWith(null);
    });

    it('handleDelete removes the widget from the DOM', () => {
      const widget = document.createElement('div');
      widget.id = 'widget-to-delete';
      widget.getBoundingClientRect = vi.fn().mockReturnValue({});
      const api = createMockEditorApi(widget);
      // Mock the remove function
      widget.remove = vi.fn();

      render(<PropertyEditorPopover editorApi={api} />);

      fireEvent.click(screen.getByTitle('Delete Property'));

      expect(widget.remove).toHaveBeenCalled();
      expect(mockUpdateContent).toHaveBeenCalled();
      expect(mockSetEditingWidget).toHaveBeenCalledWith(null);
    });
  });
});

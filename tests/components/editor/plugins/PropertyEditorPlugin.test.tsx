import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleWidgetClick,
  PropertyEditor,
} from '../../../../components/editor/plugins/PropertyEditorPlugin';
import type { EditorApi } from '../../../../types/editor';
import * as OntologyIndexHook from '../../../../hooks/useOntologyIndex';

// Mock dependencies
vi.mock('../../../../hooks/useOntologyIndex');
vi.mock('../../../../utils/properties', () => ({
  formatPropertyForDisplay: (key: string, op: string, values: string[]) =>
    `[${key}:${op}:${JSON.stringify(values)}]`,
}));

const createMockEditorApi = (): EditorApi => ({
  editorRef: { current: document.createElement('div') },
  getEditingWidget: vi.fn(() => null),
  setEditingWidget: vi.fn(),
  updateContent: vi.fn(),
  getSettings: vi.fn(() => ({ ontology: [] })),
  // Add other necessary mocks
  getSelectionParent: vi.fn(),
  queryCommandState: vi.fn(),
  execCommand: vi.fn(),
  toggleBlock: vi.fn(),
  getNote: vi.fn(),
  saveNote: vi.fn(),
  deleteNote: vi.fn(),
  showSemanticInsert: vi.fn(),
  showSummary: vi.fn(),
  insertContent: vi.fn(),
  insertHtml: vi.fn(),
  focus: vi.fn(),
  settings: { ontology: [] },
  openSemanticInsertModal: vi.fn(),
  closeSemanticInsertModal: vi.fn(),
  getSemanticModalState: vi.fn(() => ({ open: false, type: null })),
});

describe('PropertyEditorPlugin', () => {
  let mockEditorApi: EditorApi;
  let editorDiv: HTMLDivElement;

  beforeEach(() => {
    mockEditorApi = createMockEditorApi();
    editorDiv = mockEditorApi.editorRef.current!;
    document.body.appendChild(editorDiv);

    vi.mocked(OntologyIndexHook.useOntologyIndex).mockReturnValue({
      allTags: [],
      allTemplates: [],
      propertyTypes: new Map([
        [
          'status',
          {
            type: 'string',
            operators: { real: ['is'], imaginary: ['is not'] },
          },
        ],
      ]),
      getPropertyConfig: vi.fn(),
    });
  });

  describe('handleWidgetClick', () => {
    it('sets the editing widget when a property widget is clicked', () => {
      const widget = document.createElement('span');
      widget.className = 'widget property';
      editorDiv.appendChild(widget);

      const event = {
        target: widget,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent<HTMLDivElement>;

      const handled = handleWidgetClick(event, mockEditorApi);

      expect(handled).toBe(true);
      expect(mockEditorApi.setEditingWidget).toHaveBeenCalledWith(widget);
      expect(widget.id).toMatch(/^widget-/);
    });

    it('does nothing if a non-widget is clicked and nothing is being edited', () => {
      const nonWidget = document.createElement('p');
      editorDiv.appendChild(nonWidget);
      const event = {
        target: nonWidget,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent<HTMLDivElement>;

      handleWidgetClick(event, mockEditorApi);
      expect(mockEditorApi.setEditingWidget).not.toHaveBeenCalled();
    });

    it('clears editing widget if a non-widget is clicked while editing', () => {
        mockEditorApi.getEditingWidget = vi.fn(() => document.createElement('div'));
        const nonWidget = document.createElement('p');
        editorDiv.appendChild(nonWidget);
        const event = {
          target: nonWidget,
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        } as unknown as React.MouseEvent<HTMLDivElement>;

        handleWidgetClick(event, mockEditorApi);
        expect(mockEditorApi.setEditingWidget).toHaveBeenCalledWith(null);
      });
  });

  describe('PropertyEditor', () => {
    it('does not render popover when no widget is being edited', () => {
      render(<PropertyEditor editorApi={mockEditorApi} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders popover when a widget is being edited', () => {
        const widget = document.createElement('span');
        widget.id = 'test-widget';
        widget.dataset.key = 'status';
        widget.dataset.operator = 'is';
        widget.dataset.values = '["new"]';
        editorDiv.appendChild(widget);

        mockEditorApi.getEditingWidget = vi.fn(() => widget);

        render(<PropertyEditor editorApi={mockEditorApi} />);

        // PropertyEditorPopover is a complex component, so we just check for a key element
        // that indicates it has been rendered, like the save button.
        expect(screen.getByText('Save')).toBeInTheDocument();
      });
  });
});

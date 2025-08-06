import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SemanticInsertModalProvider,
  SemanticInsertToolbar,
} from '@/components/editor/plugins/SemanticInsertPlugin.tsx';
import type { EditorApi } from '@/types/editor.ts';
import * as OntologyIndexHook from '../../../../hooks/useOntologyIndex';

// Mock the useOntologyIndex hook
vi.mock('../../../../hooks/useOntologyIndex');

const createMockEditorApi = (): EditorApi => ({
  editorRef: { current: document.createElement('div') },
  getSelectionParent: vi.fn(),
  queryCommandState: vi.fn(),
  execCommand: vi.fn(),
  toggleBlock: vi.fn(),
  getEditingWidget: vi.fn(() => null),
  setEditingWidget: vi.fn(),
  getNote: vi.fn(),
  saveNote: vi.fn(),
  deleteNote: vi.fn(),
  showSemanticInsert: vi.fn(),
  showSummary: vi.fn(),
  insertContent: vi.fn(),
  focus: vi.fn(),
  settings: { ontology: [] },
  // Mocks specific to this plugin
  openSemanticInsertModal: vi.fn(),
  closeSemanticInsertModal: vi.fn(),
  getSemanticModalState: vi.fn(() => ({ open: false, type: null })),
  insertHtml: vi.fn(),
  getSettings: vi.fn(() => ({ ontology: [] })),
});

describe('SemanticInsertPlugin', () => {
  let mockEditorApi: EditorApi;

  beforeEach(() => {
    mockEditorApi = createMockEditorApi();
    // Provide a default mock implementation for the hook
    vi.mocked(OntologyIndexHook.useOntologyIndex).mockReturnValue({
      allTags: [{ id: 'tag1', label: 'TestTag', description: 'A test tag' }],
      allTemplates: [
        {
          id: 'template1',
          label: 'TestTemplate',
          description: 'A test template',
          attributes: { prop1: { type: 'string' } },
        },
      ],
      getPropertyConfig: vi.fn(),
    });
  });

  describe('SemanticInsertToolbar', () => {
    it('renders toolbar buttons', () => {
      render(<SemanticInsertToolbar editorApi={mockEditorApi} />);
      expect(screen.getByTitle('Insert Tag')).toBeInTheDocument();
      expect(screen.getByTitle('Insert Template')).toBeInTheDocument();
    });

    it('calls openSemanticInsertModal with "tag" when tag button is clicked', () => {
      render(<SemanticInsertToolbar editorApi={mockEditorApi} />);
      fireEvent.click(screen.getByTitle('Insert Tag'));
      expect(mockEditorApi.openSemanticInsertModal).toHaveBeenCalledWith('tag');
    });

    it('calls openSemanticInsertModal with "template" when template button is clicked', () => {
      render(<SemanticInsertToolbar editorApi={mockEditorApi} />);
      fireEvent.click(screen.getByTitle('Insert Template'));
      expect(mockEditorApi.openSemanticInsertModal).toHaveBeenCalledWith(
        'template'
      );
    });
  });

  describe('SemanticInsertModalProvider', () => {
    it('does not render modal when state is closed', () => {
      render(<SemanticInsertModalProvider editorApi={mockEditorApi} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders modal with tag items when state is open and type is "tag"', () => {
      mockEditorApi.getSemanticModalState = vi.fn(() => ({
        open: true,
        type: 'tag',
      }));
      render(<SemanticInsertModalProvider editorApi={mockEditorApi} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Insert Tag')).toBeInTheDocument();
      expect(screen.getByText('TestTag')).toBeInTheDocument();
    });

    it('calls insertHtml with correct tag markup on selection', () => {
      mockEditorApi.getSemanticModalState = vi.fn(() => ({
        open: true,
        type: 'tag',
      }));
      render(<SemanticInsertModalProvider editorApi={mockEditorApi} />);

      fireEvent.click(screen.getByText('TestTag'));

      const expectedHtml = `<span class="widget tag" contenteditable="false" data-tag="TestTag">#TestTag</span>&nbsp;`;
      expect(mockEditorApi.insertHtml).toHaveBeenCalledWith(expectedHtml);
      expect(mockEditorApi.closeSemanticInsertModal).toHaveBeenCalled();
    });

    it('calls insertHtml with correct template markup on selection', () => {
      mockEditorApi.getSemanticModalState = vi.fn(() => ({
        open: true,
        type: 'template',
      }));
      render(<SemanticInsertModalProvider editorApi={mockEditorApi} />);

      fireEvent.click(screen.getByText('TestTemplate'));

      const expectedHtml = `<span class="widget property" contenteditable="false" data-key="prop1" data-operator="is" data-values='[""]'>[prop1:is:""]</span>&nbsp;`;
      expect(mockEditorApi.insertHtml).toHaveBeenCalledWith(expectedHtml);
      expect(mockEditorApi.closeSemanticInsertModal).toHaveBeenCalled();
    });
  });
});

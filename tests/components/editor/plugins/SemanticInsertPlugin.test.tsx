import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SemanticInsertModalProvider,
  SemanticInsertToolbar,
} from '../../../../components/editor/plugins/SemanticInsertPlugin';
import type { EditorApi } from '../../../../types';
import * as OntologyIndexHook from '../../../../hooks/useOntologyIndex';

// Mock the useOntologyIndex hook
vi.mock('../../../../hooks/useOntologyIndex');

const createMockEditorApi = (): EditorApi => ({
  editorRef: { current: document.createElement('div') },
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
  setEditingWidget: vi.fn(),
  getEditingWidget: vi.fn(() => null),
  updateContent: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  plugins: {
    'insert-menu': {
      open: vi.fn(),
      close: vi.fn(),
    },
    'semantic-insert': {
      open: vi.fn(),
      close: vi.fn(),
    },
  },
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
      allProperties: [],
      propertyTypes: new Map(),
    });
  });

  describe('SemanticInsertToolbar', () => {
    it('renders toolbar buttons', () => {
      render(<SemanticInsertToolbar editorApi={mockEditorApi} />);
      expect(screen.getByTitle('Insert Tag')).toBeInTheDocument();
      expect(screen.getByTitle('Insert Template')).toBeInTheDocument();
    });

    it('calls the plugin open method with "tag" when tag button is clicked', () => {
      render(<SemanticInsertToolbar editorApi={mockEditorApi} />);
      fireEvent.click(screen.getByTitle('Insert Tag'));
      expect(mockEditorApi.plugins['semantic-insert'].open).toHaveBeenCalledWith('tag');
    });

    it('calls the plugin open method with "template" when template button is clicked', () => {
      render(<SemanticInsertToolbar editorApi={mockEditorApi} />);
      fireEvent.click(screen.getByTitle('Insert Template'));
      expect(mockEditorApi.plugins['semantic-insert'].open).toHaveBeenCalledWith(
        'template'
      );
    });
  });

  describe('SemanticInsertModalProvider', () => {
    // Note: Testing the modal is now harder as its state is internal.
    // These tests rely on the mock API being called correctly by the toolbar.
    // A full integration test might be better, but this is a good start.
    it('does not render modal initially', () => {
      render(<SemanticInsertModalProvider editorApi={mockEditorApi} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

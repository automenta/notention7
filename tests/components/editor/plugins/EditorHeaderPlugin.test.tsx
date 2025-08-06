import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorHeaderComponent } from '@/components/editor/plugins/EditorHeaderPlugin.tsx';
import type { EditorApi } from '@/types/editor.ts';
import type { Note } from '@/types.ts';

const createMockEditorApi = (note: Note): EditorApi => ({
  getNote: vi.fn(() => note),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  // Add other necessary mocks
  editorRef: { current: document.createElement('div') },
  getEditingWidget: vi.fn(() => null),
  setEditingWidget: vi.fn(),
  updateContent: vi.fn(),
  getSettings: vi.fn(() => ({ ontology: [] })),
  getSelectionParent: vi.fn(),
  queryCommandState: vi.fn(),
  execCommand: vi.fn(),
  toggleBlock: vi.fn(),
  saveNote: vi.fn(),
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

describe('EditorHeaderComponent', () => {
  let mockEditorApi: EditorApi;
  const initialNote: Note = {
    id: 'note1',
    title: 'Initial Title',
    content: '<p>Hello</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    properties: {},
  };

  beforeEach(() => {
    mockEditorApi = createMockEditorApi(initialNote);
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
  });

  it('renders the note title', () => {
    render(<EditorHeaderComponent editorApi={mockEditorApi} />);
    const titleInput = screen.getByPlaceholderText(
      'Note Title'
    ) as HTMLInputElement;
    expect(titleInput.value).toBe('Initial Title');
  });

  it('calls updateNote when the title is changed', () => {
    render(<EditorHeaderComponent editorApi={mockEditorApi} />);
    const titleInput = screen.getByPlaceholderText('Note Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(mockEditorApi.updateNote).toHaveBeenCalledWith({
      title: 'New Title',
    });
  });

  it('calls deleteNote when delete button is clicked and confirmed', () => {
    render(<EditorHeaderComponent editorApi={mockEditorApi} />);
    const deleteButton = screen.getByTitle('Delete note');
    fireEvent.click(deleteButton);
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this note?'
    );
    expect(mockEditorApi.deleteNote).toHaveBeenCalled();
  });

  it('does not call deleteNote when delete is not confirmed', () => {
    window.confirm = vi.fn(() => false);
    render(<EditorHeaderComponent editorApi={mockEditorApi} />);
    const deleteButton = screen.getByTitle('Delete note');
    fireEvent.click(deleteButton);
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this note?'
    );
    expect(mockEditorApi.deleteNote).not.toHaveBeenCalled();
  });
});

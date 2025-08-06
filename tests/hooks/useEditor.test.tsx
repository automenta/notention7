import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEditor } from '../../hooks/useEditor';
import { Note, AppSettings } from '../../types';

// Mock the command utilities
vi.mock('../../utils/editorCommands', () => ({
  execCommand: vi.fn(),
  toggleBlock: vi.fn(),
  queryCommandState: vi.fn(() => false),
  getSelectionParent: vi.fn(() => null),
}));

// Mock browser APIs
const mockExecCommand = vi.fn();
Object.defineProperty(document, 'execCommand', {
  value: mockExecCommand,
  writable: true,
});

const mockGetSelection = vi.fn(() => ({
  rangeCount: 1,
  getRangeAt: () => ({
    deleteContents: vi.fn(),
    insertNode: vi.fn(),
    setStartAfter: vi.fn(),
    collapse: vi.fn(),
  }),
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
}));
Object.defineProperty(window, 'getSelection', {
  value: mockGetSelection,
  writable: true,
});

describe('useEditor hook', () => {
  const mockNote: Note = {
    id: '1',
    content: '<p>Initial content</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    properties: {},
  };
  const mockSettings: AppSettings = {
    geminiApiKey: '',
    ontology: { tags: {}, properties: {} },
  };
  const mockOnSave = vi.fn();
  const mockOnDelete = vi.fn();

  let editorDiv: HTMLDivElement;

  // Setup a fake DOM element for the editor ref before each test
  beforeEach(() => {
    editorDiv = document.createElement('div');
    editorDiv.innerHTML = mockNote.content;
  });

  it('should initialize with the note content', () => {
    const { result } = renderHook(() =>
      useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
    );
    expect(result.current.content).toBe('<p>Initial content</p>');
  });

  it('should update content when handleInput is called', () => {
    const { result } = renderHook(() =>
      useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
    );

    const mockEvent = {
      currentTarget: { innerHTML: '<p>New content</p>' },
    } as unknown as React.FormEvent<HTMLDivElement>;

    act(() => {
      result.current.handleInput(mockEvent);
    });

    expect(result.current.content).toBe('<p>New content</p>');
  });

  it('should sanitize and update content when inserting HTML', () => {
    const { result } = renderHook(() =>
      useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
    );

    // --- Setup the ref to point to our fake div ---
    act(() => {
      (
        result.current.editorRef as React.MutableRefObject<HTMLDivElement>
      ).current = editorDiv;
    });

    const maliciousHtml = '<p>Hello <script>alert("xss")</script></p>';

    // --- Mock the DOM manipulation part of insertHtml ---
    // We assume the browser correctly inserts the node. We just need to update our fake div's content.
    const range = window.getSelection()?.getRangeAt(0);
    vi.spyOn(range, 'insertNode').mockImplementation((node) => {
      editorDiv.innerHTML = node.textContent || '';
    });

    act(() => {
      result.current.editorApi.insertHtml(maliciousHtml);
    });

    // updateContent reads from the ref, which now has the updated (and sanitized) content
    expect(result.current.content).toBe('<p>Hello </p>');
  });
});

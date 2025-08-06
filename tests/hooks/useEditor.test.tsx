import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEditor } from '../../hooks/useEditor';
import type { AppSettings, Note } from '../../types';

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
    title: 'Test Note',
    content: '<p>Initial content</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    properties: [],
  };
  const mockSettings: AppSettings = {
    aiEnabled: false,
    theme: 'dark',
    nostr: {
      privkey: null,
    },
    ontology: [],
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

    // Directly set the innerHTML of the fake editor
    editorDiv.innerHTML = '<p>Hello <script>alert("xss")</script></p>';

    act(() => {
      result.current.editorApi.updateContent();
    });

    expect(result.current.content).toBe('<p>Hello </p>');
  });

  describe('debounced auto-save', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      mockOnSave.mockClear();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should not save on initial render', () => {
      renderHook(() =>
        useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
      );
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should save when content changes after debounce period', () => {
      const { result } = renderHook(() =>
        useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
      );

      const mockEvent = {
        currentTarget: { innerHTML: '<p>New content</p>' },
      } as unknown as React.FormEvent<HTMLDivElement>;

      act(() => {
        result.current.handleInput(mockEvent);
      });

      // Should not have saved yet
      expect(mockOnSave).not.toHaveBeenCalled();

      // Advance time by 1.5s
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '<p>New content</p>',
        })
      );
    });
  });

  describe('handleKeyDown', () => {
    it('should prevent default action if a widget is being edited', () => {
      const { result } = renderHook(() =>
        useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
      );

      // Simulate a widget being edited
      act(() => {
        result.current.editorApi.setEditingWidget(
          document.createElement('div')
        );
      });

      const mockEvent = {
        key: 'a',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLDivElement>;

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('should not prevent default for navigation keys', () => {
      const { result } = renderHook(() =>
        useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
      );

      act(() => {
        result.current.editorApi.setEditingWidget(
          document.createElement('div')
        );
      });

      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLDivElement>;

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should not prevent default if no widget is being edited', () => {
      const { result } = renderHook(() =>
        useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
      );

      const mockEvent = {
        key: 'a',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLDivElement>;

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});

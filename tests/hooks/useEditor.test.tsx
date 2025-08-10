import {act, renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {useEditor} from '@/hooks/useEditor.ts';
import type {AppSettings, Note} from '@/types';

// Mock the command utilities
vi.mock('../../utils/editorCommands', () => ({
    execCommand: vi.fn(),
    toggleBlock: vi.fn(),
    queryCommandState: vi.fn(() => false),
    getSelectionParent: vi.fn(() => null),
}));

// Mock the selection utilities
vi.mock('../../utils/selection', () => ({
    getCursorPosition: vi.fn(() => 0),
    setCursorPosition: vi.fn(),
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
    // Note: The content is now plain text, not HTML, on initialization.
    // The hook is responsible for serializing it to HTML.
    const mockNote: Note = {
        id: '1',
        title: 'Test Note',
        content: 'Initial content',
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

    beforeEach(() => {
        editorDiv = document.createElement('div');
        editorDiv.innerHTML = mockNote.content;
        vi.clearAllMocks();
    });

    it('should initialize with the serialized note content', () => {
        const {result} = renderHook(() =>
            useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
        );
        // The hook should serialize the plain text content into HTML.
        expect(result.current.content).toBe('Initial content');
    });

    it('should update content model when handleInput is called', () => {
        const {result} = renderHook(() =>
            useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
        );

        const mockEvent = {
            currentTarget: {innerHTML: 'New content'},
        } as unknown as React.FormEvent<HTMLDivElement>;

        act(() => {
            result.current.handleInput(mockEvent);
        });

        // The hook should serialize the new content model back to HTML.
        expect(result.current.content).toBe('New content');
    });

    it('should sanitize content on input', () => {
        const {result} = renderHook(() =>
            useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
        );

        const unsafeHtml = 'Hello <script>alert("xss")</script><img src="x" onerror="alert(\'xss\')">';
        const sanitizedHtml = 'Hello <img src="x">';

        const mockEvent = {
            currentTarget: {innerHTML: unsafeHtml},
        } as unknown as React.FormEvent<HTMLDivElement>;

        act(() => {
            result.current.handleInput(mockEvent);
        });

        expect(result.current.content).toBe(sanitizedHtml);
    });

    describe('debounced auto-save', () => {
        beforeEach(() => {
            vi.useFakeTimers();
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
            const {result} = renderHook(() =>
                useEditor([], mockNote, mockSettings, mockOnSave, mockOnDelete)
            );

            const mockEvent = {
                currentTarget: {innerHTML: 'New content'},
            } as unknown as React.FormEvent<HTMLDivElement>;

            act(() => {
                result.current.handleInput(mockEvent);
            });

            expect(mockOnSave).not.toHaveBeenCalled();

            act(() => {
                vi.advanceTimersByTime(1500);
            });

            expect(mockOnSave).toHaveBeenCalledTimes(1);
            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: 'New content',
                })
            );
        });
    });

    describe('handleKeyDown', () => {
        it('should prevent default action if a widget is being edited', () => {
            const {result} = renderHook(() =>
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
            const {result} = renderHook(() =>
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
            const {result} = renderHook(() =>
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

    describe('insertHtml API', () => {
        let getCursorPositionMock: vi.Mock;

        beforeEach(async () => {
            vi.useFakeTimers();
            mockOnSave.mockClear();
            const selectionUtils = await import('../../utils/selection');
            getCursorPositionMock = selectionUtils.getCursorPosition as vi.Mock;
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should update content and tags correctly on save after insertion', () => {
            const initialContent = 'Hello world';
            const noteWithText: Note = {...mockNote, content: initialContent, tags: []};

            const {result} = renderHook(() =>
                useEditor([], noteWithText, mockSettings, mockOnSave, mockOnDelete)
            );

            // Setup the editor ref so that insertHtml can work
            act(() => {
                result.current.editorRef.current = editorDiv;
            });

            getCursorPositionMock.mockReturnValue(6);

            act(() => {
                result.current.editorApi.insertHtml(
                    '<span class="widget tag" data-tag="beautiful">#beautiful</span>'
                );
            });

            // Advance timers to trigger auto-save
            act(() => {
                vi.advanceTimersByTime(1500);
            });

            expect(mockOnSave).toHaveBeenCalledTimes(1);
            const savedNote = mockOnSave.mock.calls[0][0];

            const expectedContent = 'Hello <span class="widget tag" contenteditable="false" data-tag="beautiful">#beautiful</span>world';
            expect(savedNote.content).toBe(expectedContent);
            expect(savedNote.tags).toEqual(['beautiful']);
        });
    });
});

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEditor } from '@/hooks/useEditor';
import type { AppSettings, Note } from '@/types';
import { JSDOM } from 'jsdom';

// Mock the selection utilities
vi.mock('@/utils/selection', () => ({
    mapDomSelectionToModel: vi.fn(),
    setCursorFromModelSelection: vi.fn(),
}));

describe('useEditorEvents keyboard handling', () => {
    const mockOnSave = vi.fn();
    const mockOnDelete = vi.fn();
    const mockSettings: AppSettings = {
        aiEnabled: false,
        theme: 'dark',
        nostr: { privkey: null },
        ontology: [],
    };

    // Setup a JSDOM instance to get a real window and document
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;


    it("should split a block when 'Enter' is pressed", async () => {
        const initialNote: Note = {
            id: '1',
            title: 'Test',
            content: '<p>Hello World</p>',
            tags: [],
            properties: [],
            createdAt: '',
            updatedAt: '',
        };

        const { result } = renderHook(() => useEditor([], initialNote, mockSettings, mockOnSave, mockOnDelete));

        const editorDiv = document.createElement('div');
        editorDiv.innerHTML = result.current.content;

        act(() => {
            result.current.editorRef.current = editorDiv;
        });

        // Mock the selection to be in the middle of "Hello World"
        const selectionMock = vi.spyOn(await import('@/utils/selection'), 'mapDomSelectionToModel');
        selectionMock.mockReturnValue({
            blockIndex: 0,
            inlineIndex: 0,
            offset: 6, // after "Hello "
        });

        const mockEvent = {
            key: 'Enter',
            shiftKey: false,
            preventDefault: vi.fn(),
            currentTarget: editorDiv,
        } as unknown as React.KeyboardEvent<HTMLDivElement>;

        act(() => {
            result.current.handleKeyDown(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);

        const newModel = result.current.editorApi.state.contentModel;
        expect(newModel.length).toBe(2);
        expect(newModel[0].content[0].content).toBe('Hello ');
        expect(newModel[1].content[0].content).toBe('World');
    });

    it("should merge blocks when 'Backspace' is pressed at the start of a block", async () => {
        const initialNote: Note = {
            id: '1',
            title: 'Test',
            content: '<p>First line</p><p>Second line</p>',
            tags: [],
            properties: [],
            createdAt: '',
            updatedAt: '',
        };

        const { result } = renderHook(() => useEditor([], initialNote, mockSettings, mockOnSave, mockOnDelete));

        const editorDiv = document.createElement('div');
        editorDiv.innerHTML = result.current.content;

        act(() => {
            result.current.editorRef.current = editorDiv;
        });

        // Mock the selection to be at the start of the second block
        const selectionMock = vi.spyOn(await import('@/utils/selection'), 'mapDomSelectionToModel');
        selectionMock.mockReturnValue({
            blockIndex: 1,
            inlineIndex: 0,
            offset: 0,
        });

        const mockEvent = {
            key: 'Backspace',
            preventDefault: vi.fn(),
            currentTarget: editorDiv,
        } as unknown as React.KeyboardEvent<HTMLDivElement>;

        act(() => {
            result.current.handleKeyDown(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);

        const newModel = result.current.editorApi.state.contentModel;
        expect(newModel.length).toBe(1);
        // Note: a more robust test would check for merged text nodes
        expect(newModel[0].content.map(n => n.content).join('')).toBe('First lineSecond line');
    });
});

describe('useEditorEvents paste handling', () => {
    const mockOnSave = vi.fn();
    const mockOnDelete = vi.fn();
    const mockSettings: AppSettings = {
        aiEnabled: false,
        theme: 'dark',
        nostr: { privkey: null },
        ontology: [],
    };

    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;

    it('should sanitize pasted text and only insert the first line', async () => {
        const initialNote: Note = {
            id: '1',
            title: 'Test',
            content: '<p>Original content</p>',
            tags: [],
            properties: [],
            createdAt: '',
            updatedAt: '',
        };

        const { result } = renderHook(() => useEditor([], initialNote, mockSettings, mockOnSave, mockOnDelete));
        const editorDiv = document.createElement('div');
        act(() => {
            result.current.editorRef.current = editorDiv;
        });

        const selectionMock = vi.spyOn(await import('@/utils/selection'), 'mapDomSelectionToModel');
        selectionMock.mockReturnValue({
            blockIndex: 0,
            inlineIndex: 0,
            offset: 0,
        });

        const pastedHtml = '<b>Hello</b> World<br><i>more content</i><script>alert("pwned")</script>';
        const pastedText = 'just plain text';

        const getData = vi.fn(type => {
            if (type === 'text/html') return pastedHtml;
            if (type === 'text/plain') return pastedText;
            return '';
        });

        const mockEvent = {
            preventDefault: vi.fn(),
            currentTarget: editorDiv,
            clipboardData: { getData },
        } as unknown as React.ClipboardEvent<HTMLDivElement>;

        // Spy on the dispatch function to inspect the transaction
        const dispatchSpy = vi.spyOn(result.current.editorApi, 'dispatchTransaction');

        act(() => {
            result.current.handlePaste(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        expect(getData).toHaveBeenCalledWith('text/html');

        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        const transaction = dispatchSpy.mock.calls[0][0];

        // Apply the transaction to a dummy model to check the final state
        const {newDoc} = transaction.apply();

        // The parseInline function strips tags, and the normalization merges text nodes.
        // For an insertion, the pasted content should be prepended to the original content.
        expect(newDoc[0].content[0].content).toBe('Hello WorldOriginal content');
        // It should not contain the second line from the pasted content.
        expect(newDoc[0].content[0].content).not.toContain('more content');
    });
});

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

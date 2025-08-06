import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ToolbarComponent} from '@/components/editor/plugins/ToolbarPlugin.tsx';
import type {EditorApi} from '@/types/editor.ts';

// A comprehensive mock for the EditorApi
const createMockEditorApi = (): EditorApi => {
    const editorRef = {current: document.createElement('div')};
    const selectionParent = document.createElement('p');
    editorRef.current.appendChild(selectionParent);

    return {
        editorRef,
        getSelectionParent: vi.fn(() => selectionParent),
        queryCommandState: vi.fn(() => false),
        execCommand: vi.fn(),
        toggleBlock: vi.fn(),
        getEditingWidget: vi.fn(() => null),
        setEditingWidget: vi.fn(),
        // Add any other methods from EditorApi that are used or might be used
        // to ensure the mock is complete.
        getNote: vi.fn(),
        saveNote: vi.fn(),
        deleteNote: vi.fn(),
        showSemanticInsert: vi.fn(),
        showSummary: vi.fn(),
        insertContent: vi.fn(),
        focus: vi.fn(),
        settings: {},
    };
};

describe('ToolbarComponent', () => {
    let mockEditorApi: EditorApi;

    beforeEach(() => {
        mockEditorApi = createMockEditorApi();
    });

    it('renders all toolbar buttons', () => {
        render(<ToolbarComponent editorApi={mockEditorApi}/>);
        expect(screen.getByTitle('Bold')).toBeInTheDocument();
        expect(screen.getByTitle('Italic')).toBeInTheDocument();
        expect(screen.getByTitle('Underline')).toBeInTheDocument();
        expect(screen.getByTitle('Strikethrough')).toBeInTheDocument();
        expect(screen.getByTitle('Heading 1')).toBeInTheDocument();
        expect(screen.getByTitle('Heading 2')).toBeInTheDocument();
        expect(screen.getByTitle('Heading 3')).toBeInTheDocument();
        expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
        expect(screen.getByTitle('Numbered List')).toBeInTheDocument();
        expect(screen.getByTitle('Blockquote')).toBeInTheDocument();
        expect(screen.getByTitle('Code Block')).toBeInTheDocument();
        expect(screen.getByTitle('Horizontal Rule')).toBeInTheDocument();
    });

    it('calls execCommand with "bold" when bold button is clicked', () => {
        render(<ToolbarComponent editorApi={mockEditorApi}/>);
        fireEvent.click(screen.getByTitle('Bold'));
        expect(mockEditorApi.execCommand).toHaveBeenCalledWith('bold');
    });

    it('calls toggleBlock with "h1" when Heading 1 button is clicked', () => {
        render(<ToolbarComponent editorApi={mockEditorApi}/>);
        fireEvent.click(screen.getByTitle('Heading 1'));
        expect(mockEditorApi.toggleBlock).toHaveBeenCalledWith('h1');
    });

    it('updates button active state based on queryCommandState', () => {
        // Mock that 'bold' is active
        mockEditorApi.queryCommandState = vi.fn((cmd) => cmd === 'bold');
        render(<ToolbarComponent editorApi={mockEditorApi}/>);

        // To trigger the state update, we need to simulate a selection change
        const editorDiv = mockEditorApi.editorRef.current;
        fireEvent.focus(editorDiv); // or keyUp, mouseUp

        // Check if the button has the active class
        const boldButton = screen.getByTitle('Bold');
        expect(boldButton.className).toContain('bg-gray-600');
    });

    it('updates block button active state based on selection parent', () => {
        // Mock that the selection is inside an h1
        const h1 = document.createElement('h1');
        mockEditorApi.getSelectionParent = vi.fn(() => h1);

        render(<ToolbarComponent editorApi={mockEditorApi}/>);

        // Trigger update
        const editorDiv = mockEditorApi.editorRef.current;
        fireEvent.focus(editorDiv);

        const h1Button = screen.getByTitle('Heading 1');
        expect(h1Button.className).toContain('bg-gray-600');
    });
});

import { describe, it, expect, vi } from 'vitest';
import { inputRulesPlugin } from '@/components/editor/plugins/inputRulesPlugin';
import type { EditorApi } from '@/types';

// Mock the getSelection API
const mockGetSelection = (textBeforeCaret: string) => {
  const range = {
    startContainer: {
      nodeType: Node.TEXT_NODE,
      textContent: textBeforeCaret,
    },
    startOffset: textBeforeCaret.length,
    deleteContents: vi.fn(),
    setStart: vi.fn(),
  };

  return {
    isCollapsed: true,
    rangeCount: 1,
    getRangeAt: () => range,
  };
};

describe('inputRulesPlugin', () => {
  it('should create a tag widget when typing #tag followed by a space', () => {
    // Arrange
    const mockEditorApi = {
      insertHtml: vi.fn(),
      plugins: {}, // Mock other plugins if needed
    } as unknown as EditorApi;

    const textBeforeCaret = 'Hello world #testing ';
    window.getSelection = vi.fn().mockImplementation(() => mockGetSelection(textBeforeCaret));

    // Act
    const handled = inputRulesPlugin.onInput?.({} as React.FormEvent<HTMLDivElement>, mockEditorApi);

    // Assert
    expect(handled).toBe(true);
    expect(mockEditorApi.insertHtml).toHaveBeenCalledOnce();
    expect(mockEditorApi.insertHtml).toHaveBeenCalledWith(
      '<span class="widget tag" contenteditable="false" data-tag="testing">#testing</span>&nbsp;'
    );
  });

  it('should not create a tag if there is no space after the tag', () => {
    // Arrange
    const mockEditorApi = {
      insertHtml: vi.fn(),
    } as unknown as EditorApi;

    const textBeforeCaret = 'Hello world #testing';
    window.getSelection = vi.fn().mockImplementation(() => mockGetSelection(textBeforeCaret));

    // Act
    const handled = inputRulesPlugin.onInput?.({} as React.FormEvent<HTMLDivElement>, mockEditorApi);

    // Assert
    expect(handled).toBe(false);
    expect(mockEditorApi.insertHtml).not.toHaveBeenCalled();
  });

    it('should create a property widget when typing [key:value]', () => {
        // Arrange
        const mockEditorApi = {
            insertHtml: vi.fn(),
            plugins: {},
        } as unknown as EditorApi;

        const textBeforeCaret = 'This is a test [status:done]';
        window.getSelection = vi.fn().mockImplementation(() => mockGetSelection(textBeforeCaret));

        // Act
        const handled = inputRulesPlugin.onInput?.({} as React.FormEvent<HTMLDivElement>, mockEditorApi);

        // Assert
        expect(handled).toBe(true);
        expect(mockEditorApi.insertHtml).toHaveBeenCalledOnce();
        // Just check that it was called, the exact HTML is complex to match here
        expect(mockEditorApi.insertHtml).toHaveBeenCalledWith(expect.stringContaining('data-key="status"'));
    });
});

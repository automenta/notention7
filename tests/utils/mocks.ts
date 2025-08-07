import { vi } from 'vitest';
import type { EditorApi } from '../../types';

export const createMockEditorApi = (
  editingWidget: HTMLElement | null = null
): EditorApi => {
  const editorDiv = document.createElement('div');
  if (editingWidget) {
    editorDiv.appendChild(editingWidget);
  }
  return {
    editorRef: { current: editorDiv },
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
    getEditingWidget: () => editingWidget,
    updateWidget: vi.fn(),
    deleteWidget: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    syncViewToModel: vi.fn(),
    scheduleWidgetEdit: vi.fn(),
    plugins: {
      'semantic-insert': {
        open: vi.fn(),
        close: vi.fn(),
      },
    },
  } as unknown as EditorApi;
};

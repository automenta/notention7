import React from 'react';
import { AppSettings, Note } from './index';

export interface EditorApi {
  editorRef: React.RefObject<HTMLDivElement>;
  execCommand: (command: string, value?: string) => void;
  toggleBlock: (tag: string) => void;
  queryCommandState: (command: string) => boolean;
  getSelectionParent: () => HTMLElement | null;
  // For semantic insert modal
  openSemanticInsertModal: (type: 'tag' | 'template') => void;
  closeSemanticInsertModal: () => void;
  getSemanticModalState: () => {
    open: boolean;
    type: 'tag' | 'template' | null;
  };
  insertHtml: (html: string) => void;
  getNote: () => Note;
  getSettings: () => AppSettings;
  // For property editor popover
  setEditingWidget: (element: HTMLElement | null) => void;
  getEditingWidget: () => HTMLElement | null;
  updateContent: () => void;
  // For header plugin
  updateNote: (updatedFields: Partial<Note>) => void;
  deleteNote: () => void;
}

/**
 * Defines the structure for an editor plugin. A plugin is an object that can
 * provide different functionalities to the editor by implementing one or more
_of these properties.
 */
export interface EditorPlugin {
  id: string;
  name: string;

  /**
   * Optional: A React component to be rendered above the editor, in the header area.
   */
  HeaderComponent?: React.FC<{ editorApi: EditorApi }>;

  /**
   * Optional: A React component to be rendered in the editor's toolbar area.
   * It receives the editor API to execute commands.
   */
  ToolbarComponent?: React.FC<{ editorApi: EditorApi }>;

  /**
   * Optional: A React component that can be rendered as a popover, for example,
   * for editing a widget. The editor core will manage its visibility.
   */
  Popover?: React.FC<{
    editorApi: EditorApi;
    target: HTMLElement; // The DOM element the popover should anchor to.
    close: () => void;
  }>;

  /**
   * Optional: A React component that can be rendered as a modal. The editor
   * core will manage its visibility.
   */
  Modal?: React.FC<{
    editorApi: EditorApi;
    isOpen: boolean;
    close: () => void;
  }>;

  /**
   * Optional: A function to handle the editor's `onInput` event.
   * Can be used for implementing input rules (e.g., markdown shortcuts).
   * @returns `true` if the event was handled and should not be processed further.
   */
  onInput?: (
    event: React.FormEvent<HTMLDivElement>,
    editorApi: EditorApi
  ) => boolean | void;

  /**
   * Optional: A function to handle the editor's `onClick` event.
   * Useful for detecting clicks on specific elements, like custom widgets.
   * @returns `true` if the event was handled and should not be processed further.
   */
  onClick?: (
    event: React.MouseEvent<HTMLDivElement>,
    editorApi: EditorApi
  ) => boolean | void;
}

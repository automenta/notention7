import React from 'react';
import type {Event as NostrToolsEvent} from 'nostr-tools';

export type NostrEvent = NostrToolsEvent;

export interface Property {
    key: string;
    operator: string;
    values: string[];
}

export interface OntologyAttribute {
    type: 'string' | 'date' | 'number' | 'enum' | 'datetime' | 'geo';
    description?: string;
    options?: string[]; // for enum type
    operators: {
        real: string[];
        imaginary: string[];
    };
}

export interface OntologyNode {
    id: string;
    label: string;
    description?: string;
    attributes?: {
        [key: string]: OntologyAttribute;
    };
    children?: OntologyNode[];
}

export interface Note {
    id: string;
    title: string;
    /** Content stored as an HTML string */
    content: string;
    tags: string[];
    properties: Property[];
    createdAt: string;
    updatedAt: string;
    nostrEventId?: string;
    publishedAt?: string;
}

export interface AppSettings {
    aiEnabled: boolean;
    geminiApiKey: string | null;
    theme: 'light' | 'dark';
    nostr: {
        privkey: string | null;
    };
    ontology: OntologyNode[];
}

export interface NostrProfile {
    name?: string;
    display_name?: string;
    picture?: string;
    about?: string;
    banner?: string;
    website?: string;
    lud16?: string;
}

export interface Contact {
    pubkey: string;
    name?: string;
    picture?: string;
    about?: string;
}

export type View =
    | 'notes'
    | 'ontology'
    | 'network'
    | 'chat'
    | 'settings'
    | 'map'
    | 'discovery';

// --- Content Model Types ---

// Inline content: text or interactive widgets
export type TextNode = {
    type: 'text';
    content: string;
};

export type TagWidgetNode = {
    type: 'widget';
    kind: 'tag';
    tag: string;
};

export type PropertyWidgetNode = {
    type: 'widget';
    kind: 'property';
    id: string;
    key: string;
    operator: string;
    values: unknown[];
};

export type WidgetNode = TagWidgetNode | PropertyWidgetNode;

// An inline node is either text or a widget
export type InlineNode = TextNode | WidgetNode;

// Block content: paragraphs that contain inline content
export type ParagraphNode = {
    type: 'paragraph';
    content: InlineNode[];
};

// A block node can be a paragraph (and later, maybe a list, etc.)
export type BlockNode = ParagraphNode;

// The full document is an array of BlockNodes
export type ContentModel = BlockNode[];

// --- Editor Types ---

export interface EditorSelection {
    // The index of the block node in the content model
    blockIndex: number;
    // The index of the inline node within the block
    inlineIndex: number;
    // The character offset within the inline text node
    offset: number;
    // The end of the selection, for ranges
    end?: {
        blockIndex: number;
        inlineIndex: number;
        offset: number;
    };
}

import { Transaction } from '@/utils/transaction';
import { EditorState } from '@/hooks/reducers/editorReducer';

export interface EditorApi {
    editorRef: React.RefObject<HTMLDivElement>;
    // The current state of the editor (model, selection, etc.)
    state: EditorState;
    // The primary method for dispatching changes to the document
    dispatchTransaction: (tr: Transaction) => void;

    execCommand: (command: string, value?: string) => void;
    toggleBlock: (tag: string) => void;
    queryCommandState: (command: string) => boolean;
    getSelectionParent: () => HTMLElement | null;
    getNote: () => Note;
    getSettings: () => AppSettings;

    // For property editor popover
    setEditingWidget: (element: HTMLElement | null) => void;
    getEditingWidget: () => HTMLElement | null;
    syncViewToModel: () => void;
    scheduleWidgetEdit: (widgetId: string) => void;

    // For header plugin
    updateNote: (updatedFields: Partial<Note>) => void;
    deleteNote: () => void;

    // Extensible plugin API container
    plugins: {
        [pluginId: string]: unknown;
    };
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
     * Optional: An object containing functions that can be called from other plugins
     * or the main editor. The core editor will aggregate these APIs.
     */
    api?: unknown;

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

// Defines the shape of the props that editor components will receive
export interface EditorComponentProps {
    note: Note;
    onSave: (note: Note) => void;
    onDelete: (id: string) => void;
    settings: AppSettings;
}

// Defines the shape of an available editor component
export interface AvailableEditor {
    id: string;
    name: string;
    component: React.FC<EditorComponentProps>;
}

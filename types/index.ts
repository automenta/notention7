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
    id: string; // For referencing the widget
    key: string;
    operator: string;
    values: unknown[];
};

export type WidgetNode = TagWidgetNode | PropertyWidgetNode;

export type ContentNode = TextNode | WidgetNode;

// --- Editor Types ---

export interface EditorApi {
    editorRef: React.RefObject<HTMLDivElement>;
    execCommand: (command: string, value?: string) => void;
    toggleBlock: (tag: string) => void;
    queryCommandState: (command: string) => boolean;
    getSelectionParent: () => HTMLElement | null;
    insertHtml: (html: string) => void;
    getNote: () => Note;
    getSettings: () => AppSettings;
    // For property editor popover
    setEditingWidget: (element: HTMLElement | null) => void;
    getEditingWidget: () => HTMLElement | null;
    syncViewToModel: () => void;
    updateWidget: (widgetId: string, data: Partial<PropertyWidgetNode>) => void;
    deleteWidget: (widgetId: string) => void;
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

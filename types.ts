
import type { Event as NostrToolsEvent } from 'nostr-tools';

export type NostrEvent = NostrToolsEvent;

export interface Property {
    key: string;
    operator: string;
    values: string[];
};

export interface OntologyAttribute {
    type: 'string' | 'date' | 'number' | 'enum' | 'datetime' | 'geo';
    description?: string;
    options?: string[]; // for enum type
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

export type View = 'notes' | 'ontology' | 'network' | 'chat' | 'settings' | 'map';
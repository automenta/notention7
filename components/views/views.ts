import React from 'react';
import { NotesView } from './NotesView';
import { OntologyView } from './OntologyView';
import { MapView } from './MapView';
import { NetworkView } from './NetworkView';
import { DiscoveryView } from './DiscoveryView';
import { ChatView } from './ChatView';
import { SettingsView } from './SettingsView';

export interface View {
  name: string;
  component: React.FC;
}

const views: Record<string, View> = {
  notes: { name: 'Notes', component: NotesView },
  ontology: { name: 'Ontology', component: OntologyView },
  map: { name: 'Map', component: MapView },
  network: { name: 'Network', component: NetworkView },
  discovery: { name: 'Discovery', component: DiscoveryView },
  chat: { name: 'Chat', component: ChatView },
  settings: { name: 'Settings', component: SettingsView },
};

export const useViews = () => {
  return {
    views,
    getView: (id: string): View | undefined => views[id],
  };
};

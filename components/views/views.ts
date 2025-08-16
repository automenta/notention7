import React from 'react';
import { NotesView } from './NotesView';
import { OntologyView } from './OntologyView';
import { MapView } from './MapView';
import { NetworkView } from './NetworkView';
import { DiscoveryView } from './DiscoveryView';
import { ChatView } from './ChatView';
import { SettingsView } from './SettingsView';
import { useCollection } from '../../hooks/useCollection';

export interface View {
  id: string;
  name: string;
  component: React.FC;
}

const views: View[] = [
  { id: 'notes', name: 'Notes', component: NotesView },
  { id: 'ontology', name: 'Ontology', component: OntologyView },
  { id: 'map', name: 'Map', component: MapView },
  { id: 'network', name: 'Network', component: NetworkView },
  { id: 'discovery', name: 'Discovery', component: DiscoveryView },
  { id: 'chat', name: 'Chat', component: ChatView },
  { id: 'settings', name: 'Settings', component: SettingsView },
];

export const useViews = () => {
  return useCollection(views);
};

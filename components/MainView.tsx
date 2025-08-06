import React from 'react';
import { useView } from './contexts/ViewContext';
import { useSettings } from './contexts/SettingsContext';
import { useNotes } from './contexts/NotesContext';
import { LoadingSpinner } from './icons';
import { NotesView } from './views/NotesView';
import { OntologyView } from './views/OntologyView';
import { MapView } from './views/MapView';
import { NetworkView } from './views/NetworkView';
import { ChatView } from './views/ChatView';
import { SettingsView } from './views/SettingsView';

import { View } from '../types';

const viewMap: Record<View, React.ComponentType> = {
  notes: NotesView,
  ontology: OntologyView,
  map: MapView,
  network: NetworkView,
  chat: ChatView,
  settings: SettingsView,
};

export const MainView: React.FC = () => {
  const { activeView } = useView();
  const { settingsLoading } = useSettings();
  const { notesLoading } = useNotes();

  if (notesLoading || settingsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  const ActiveViewComponent = viewMap[activeView] ?? null;

  return ActiveViewComponent ? <ActiveViewComponent /> : null;
};

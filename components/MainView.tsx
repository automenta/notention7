import React from 'react';
import { useView } from './contexts/ViewContext';
import { useSettings } from '../hooks/useSettingsContext';
import { useNotes } from './contexts/NotesContext';
import { LoadingSpinner } from './icons';
import { NotesView } from './views/NotesView';
import { OntologyView } from './views/OntologyView';
import { MapView } from './views/MapView';
import { NetworkView } from './views/NetworkView';
import { ChatView } from './views/ChatView';
import { SettingsView } from './views/SettingsView';

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

  switch (activeView) {
    case 'notes':
      return <NotesView />;
    case 'ontology':
      return <OntologyView />;
    case 'map':
      return <MapView />;
    case 'network':
      return <NetworkView />;
    case 'chat':
      return <ChatView />;
    case 'settings':
      return <SettingsView />;
    default:
      return null;
  }
};

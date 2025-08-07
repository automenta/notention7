import React from 'react';
import { useViewContext } from '../hooks/useViewContext';
import { useSettingsContext } from '../hooks/useSettingsContext';
import { useNotesContext } from '../hooks/useNotesContext';
import { LoadingSpinner } from './icons';
import { NotesView } from './views/NotesView';
import { OntologyView } from './views/OntologyView';
import { MapView } from './views/MapView';
import { NetworkView } from './views/NetworkView';
import { ChatView } from './views/ChatView';
import { SettingsView } from './views/SettingsView';

export const MainView: React.FC = () => {
  const { activeView } = useViewContext();
  const { settingsLoading } = useSettingsContext();
  const { notesLoading } = useNotesContext();

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

import React from 'react';
import { useNotesContext } from './contexts/NotesContext';
import { LoadingSpinner } from './icons';
import { useViews } from './views/views';
import { useAppContext } from './contexts/AppContext';

export const MainView: React.FC = () => {
  const { activeView, settingsLoading } = useAppContext();
  const { notesLoading } = useNotesContext();
  const { getView } = useViews();

  if (notesLoading || settingsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  const ActiveView = getView(activeView)?.component;

  if (ActiveView) {
    return <ActiveView />;
  }

  return null;
};

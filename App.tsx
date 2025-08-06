import React, { useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainView } from './components/MainView';
import { useNotes } from './components/contexts/NotesContext';
import { useView } from './components/contexts/ViewContext';
import { Note } from './types';

const sortNotesByDate = (notes: Note[]) => {
  return notes
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
};

const App: React.FC = () => {
  const { notes, addNote, notesLoading } = useNotes();
  const { activeView, setActiveView, selectedNoteId, setSelectedNoteId } =
    useView();

  const sortedNotes = useMemo(() => sortNotesByDate(notes), [notes]);

  // Auto-select the most recent note on load or when switching to 'notes' view
  useEffect(() => {
    if (
      activeView === 'notes' &&
      !notesLoading &&
      selectedNoteId === null &&
      sortedNotes.length > 0
    ) {
      setSelectedNoteId(sortedNotes[0].id);
    }
  }, [
    notesLoading,
    sortedNotes,
    selectedNoteId,
    activeView,
    setSelectedNoteId,
  ]);

  const handleNewNote = () => {
    const newNote = addNote();
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
      <Header onNewNote={handleNewNote} />
      <div className="flex flex-1 overflow-hidden">
        {activeView === 'notes' && (
          <div className="w-[320px] flex-shrink-0 bg-gray-900 border-r border-gray-700/50">
            <Sidebar />
          </div>
        )}

        <main className="flex-1 p-3 overflow-hidden">
          <MainView />
        </main>
      </div>
    </div>
  );
};

export default App;

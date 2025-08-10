import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { useNotesContext } from './components/contexts/NotesContext';
import { MainLayout } from './components/MainLayout';
import { useViewContext } from './components/contexts/ViewContext';
import { CommandPalette } from './components/common/CommandPalette';
import { useCommands } from './hooks/useCommands';

const App: React.FC = () => {
  const { addNote } = useNotesContext();
  const { setActiveView, setSelectedNoteId } = useViewContext();
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const commands = useCommands();

  const handleNewNote = () => {
    const newNote = addNote();
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
        <Header onNewNote={handleNewNote} />
        <MainLayout />
      </div>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />
    </>
  );
};

export default App;

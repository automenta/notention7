import React, { ReactNode, useContext } from 'react';
import { useNotes as useNotesService } from '../../hooks/useNotes';
import { NotesContext } from './notes';

export const NotesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { notes, addNote, updateNote, deleteNote, notesLoading } =
    useNotesService();

  return (
    <NotesContext.Provider
      value={{ notes, addNote, updateNote, deleteNote, notesLoading }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

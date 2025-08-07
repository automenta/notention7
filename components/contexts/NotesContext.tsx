import React, { ReactNode } from 'react';
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

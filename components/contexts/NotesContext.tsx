import React, { createContext, ReactNode } from 'react';
import { useNotes as useNotesService } from '../../hooks/useNotes';
import type { Note } from '../../types';

interface NotesContextType {
  notes: Note[];
  addNote: () => Note;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  notesLoading: boolean;
}

export const NotesContext = createContext<NotesContextType | undefined>(
  undefined
);

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

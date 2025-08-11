import { createContext, useContext } from 'react';
import type { Note } from '../../types';

export interface NotesContextType {
  notes: Note[];
  addNote: () => Note;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  notesLoading: boolean;
}

export const NotesContext = createContext<NotesContextType | undefined>(
  undefined
);

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

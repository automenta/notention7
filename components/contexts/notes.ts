import { createContext } from 'react';
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

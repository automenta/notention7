import React, { ReactNode } from 'react';
import { useNotes as useNotesService } from '../../hooks/useNotes';
import {
  NotesContext,
  NotesContextType,
  useNotesContext,
} from './notes.context';

// 3. Create the provider component
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

// 4. Create the consumer hook
export { useNotesContext };

import { useContext } from 'react';
import {
  NotesContext,
  type NotesContextType,
} from '../components/contexts/notes';

export const useNotesContext = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

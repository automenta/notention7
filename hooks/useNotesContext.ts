import { useContext } from 'react';
import {
  NotesContext,
  type NotesContextType,
} from '../components/contexts/NotesContext';

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

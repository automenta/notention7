import React, {createContext, ReactNode, useContext} from 'react';
import {useNotes as useNotesHook} from '../../services/notes';
import {Note} from '@/types.ts';

interface NotesContextType {
    notes: Note[];
    addNote: () => Note;
    updateNote: (note: Note) => void;
    deleteNote: (id: string) => void;
    notesLoading: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const {notes, addNote, updateNote, deleteNote, notesLoading} = useNotesHook();

    return (
        <NotesContext.Provider value={{notes, addNote, updateNote, deleteNote, notesLoading}}>
            {children}
        </NotesContext.Provider>
    );
};

export const useNotesContext = (): NotesContextType => {
    const context = useContext(NotesContext);
    if (context === undefined) {
        throw new Error('useNotesContext must be used within a NotesProvider');
    }
    return context;
};

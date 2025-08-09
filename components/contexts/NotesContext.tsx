import React, {createContext, ReactNode, useContext} from 'react';
import {useNotes as useNotesService} from '../../hooks/useNotes';
import type {Note} from '../../types';

// 1. Define the context type
export interface NotesContextType {
    notes: Note[];
    addNote: () => Note;
    updateNote: (note: Note) => void;
    deleteNote: (id: string) => void;
    notesLoading: boolean;
}

// 2. Create the context
// eslint-disable-next-line react-refresh/only-export-components
export const NotesContext = createContext<NotesContextType | undefined>(
    undefined
);

// 3. Create the provider component
export const NotesProvider: React.FC<{ children: ReactNode }> = ({
                                                                     children,
                                                                 }) => {
    const {notes, addNote, updateNote, deleteNote, notesLoading} =
        useNotesService();

    return (
        <NotesContext.Provider
            value={{notes, addNote, updateNote, deleteNote, notesLoading}}
        >
            {children}
        </NotesContext.Provider>
    );
};

// 4. Create the consumer hook
// eslint-disable-next-line react-refresh/only-export-components
export const useNotesContext = () => {
    const context = useContext(NotesContext);
    if (context === undefined) {
        throw new Error('useNotesContext must be used within a NotesProvider');
    }
    return context;
};

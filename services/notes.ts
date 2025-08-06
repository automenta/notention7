import {useLocalForage} from '../hooks/useLocalForage';
import type {Note} from '../types';

export const useNotes = () => {
    const [notes, setNotes, notesLoading] = useLocalForage<Note[]>(
        'notention-notes',
        []
    );

    const addNote = () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: 'Untitled Note',
            content: '',
            tags: [],
            properties: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setNotes((prev) => [newNote, ...prev]);
        return newNote;
    };

    const updateNote = (updatedNote: Note) => {
        setNotes((prev) =>
            prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
        );
    };

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((note) => note.id !== id));
    };

    return {
        notes,
        addNote,
        updateNote,
        deleteNote,
        notesLoading,
    };
};

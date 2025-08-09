import {useMemo} from 'react';
import {useLocalForage} from './useLocalForage';
import {sortNotesByDate} from '../utils/notes';
import type {Note} from '@/types';

export const useNotes = () => {
    const [notes, setNotes, notesLoading] = useLocalForage<Note[]>(
        'notention-notes',
        []
    );

    const sortedNotes = useMemo(() => sortNotesByDate(notes), [notes]);

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
            prev.map((n) =>
                n.id === updatedNote.id
                    ? {...updatedNote, updatedAt: new Date().toISOString()}
                    : n
            )
        );
    };

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((note) => note.id !== id));
    };

    return {
        notes: sortedNotes,
        addNote,
        updateNote,
        deleteNote,
        notesLoading,
    };
};

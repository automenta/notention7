import {useMemo, useCallback} from 'react';
import {useLocalForage} from './useLocalForage';
import {sortNotesByDate} from '../utils/notes';
import type {Note} from '@/types';

export const useNotes = () => {
    const [rawNotes, setNotes, notesLoading] = useLocalForage<Note[]>(
        'notention-notes',
        []
    );

    const notes = useMemo(() => sortNotesByDate(rawNotes), [rawNotes]);

    const addNote = useCallback(() => {
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
    }, [setNotes]);

    const updateNote = useCallback(
        (updatedNote: Note) => {
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === updatedNote.id
                        ? {...updatedNote, updatedAt: new Date().toISOString()}
                        : n
                )
            );
        },
        [setNotes]
    );

    const deleteNote = useCallback(
        (id: string) => {
            setNotes((prev) => prev.filter((note) => note.id !== id));
        },
        [setNotes]
    );

    return {
        notes,
        addNote,
        updateNote,
        deleteNote,
        notesLoading,
    };
};

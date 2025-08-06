import { useLocalForage } from '../hooks/useLocalForage';
import type { Note } from '../types';

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

  const deleteNote = (
    id: string,
    currentSelectedId: string | null,
    setSelectedNoteId: (id: string | null) => void
  ) => {
    // First, find the notes that will remain after deletion
    const remainingNotes = notes ? notes.filter((note) => note.id !== id) : [];

    // Update the persisted notes
    setNotes(remainingNotes);

    // Then, handle the selection logic
    if (currentSelectedId === id) {
      const sortedNotes = remainingNotes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const newSelectedId = sortedNotes.length > 0 ? sortedNotes[0].id : null;
      setSelectedNoteId(newSelectedId);
    }
  };

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    notesLoading,
  };
};

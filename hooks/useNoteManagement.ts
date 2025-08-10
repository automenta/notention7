import {useEffect, useMemo} from 'react';
import {useNotesContext} from '../components/contexts/NotesContext';
import {useViewContext} from '../components/contexts/ViewContext';
import {sortNotesByDate} from '../utils/notes';

export const useNoteManagement = () => {
    const {notes, deleteNote, notesLoading} = useNotesContext();
    const {activeView, selectedNoteId, setSelectedNoteId} = useViewContext();

    // Find the full selected note object
    const selectedNote = useMemo(
        () => notes.find((note) => note.id === selectedNoteId),
        [notes, selectedNoteId]
    );

    // Auto-select the first note if none is selected (logic from useAutoSelectNote)
    useEffect(() => {
        if (
            activeView === 'notes' &&
            !notesLoading &&
            selectedNoteId === null &&
            notes.length > 0
        ) {
            // Select the most recently updated note by default
            const mostRecentNote = sortNotesByDate(notes)[0];
            if (mostRecentNote) {
                setSelectedNoteId(mostRecentNote.id);
            }
        }
    }, [
        notesLoading,
        notes,
        selectedNoteId,
        activeView,
        setSelectedNoteId,
    ]);

    // Handle deleting a note and selecting the next one
    const handleDeleteAndSelectNext = (idToDelete: string) => {
        if (selectedNoteId === idToDelete) {
            const sortedNotes = sortNotesByDate(notes);
            const currentIndex = sortedNotes.findIndex((n) => n.id === idToDelete);
            const noteToSelect =
                sortedNotes[currentIndex - 1] || sortedNotes[currentIndex + 1] || null;
            setSelectedNoteId(noteToSelect ? noteToSelect.id : null);
        }
        deleteNote(idToDelete);
    };

    return {
        selectedNote,
        handleDeleteAndSelectNext,
    };
};

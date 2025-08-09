import {useEffect} from 'react';
import {useNotesContext} from './useNotesContext';
import {useViewContext} from './useViewContext';

export const useAutoSelectNote = () => {
    const {notes, notesLoading} = useNotesContext();
    const {activeView, selectedNoteId, setSelectedNoteId} = useViewContext();

    useEffect(() => {
        if (
            activeView === 'notes' &&
            !notesLoading &&
            selectedNoteId === null &&
            notes.length > 0
        ) {
            setSelectedNoteId(notes[0].id);
        }
    }, [
        notesLoading,
        notes,
        selectedNoteId,
        activeView,
        setSelectedNoteId,
    ]);
};

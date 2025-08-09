import {useEffect} from 'react';
import {useNotesContext} from '../components/contexts/NotesContext';
import {useViewContext} from '../components/contexts/ViewContext';

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

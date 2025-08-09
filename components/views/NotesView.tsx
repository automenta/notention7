import React from 'react';
import React from 'react';
import {useNotesContext} from '../contexts/NotesContext';
import {EditorManager} from '../EditorManager';
import {CubeTransparentIcon} from '../icons';
import {useAppContext} from '../contexts/AppContext';
import {useNoteManagement} from '../../hooks/useNoteManagement';
import {Placeholder} from '../common/Placeholder';

export const NotesView: React.FC = () => {
    const {updateNote} = useNotesContext();
    const {settings} = useAppContext();
    const {selectedNote, handleDeleteAndSelectNext} = useNoteManagement();

    if (!selectedNote) {
        return (
            <Placeholder
                icon={<CubeTransparentIcon/>}
                title="No Note Selected"
                message="Create a new note or select one from the list to get started."
            />
        );
    }

    return (
        <EditorManager
            key={selectedNote.id}
            note={selectedNote}
            onSave={updateNote}
            onDelete={handleDeleteAndSelectNext}
            settings={settings}
        />
    );
};

import React from 'react';
import {useNotesContext} from '../contexts/NotesContext';
import {EditorManager} from '../EditorManager';
import {CubeTransparentIcon} from '../icons';
import {useSettingsContext} from '../contexts/settings.context';
import {useNoteManagement} from '../../hooks/useNoteManagement';
import {Placeholder} from '../common/Placeholder';

export const NotesView: React.FC = () => {
    const {updateNote} = useNotesContext();
    const {settings} = useSettingsContext();
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

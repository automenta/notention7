import React from 'react';
import {useNotes} from '../contexts/NotesContext';
import {useView} from '../contexts/ViewContext';
import {useSettings} from '../contexts/SettingsContext';
import {EditorManager} from '../EditorManager';
import {CubeTransparentIcon} from '../icons';

interface PlaceholderViewProps {
    icon: React.ReactElement<{ className?: string }>;
    title: string;
    message: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({
                                                             icon,
                                                             title,
                                                             message,
                                                         }) => (
    <div
        className="flex flex-col items-center justify-center h-full text-center bg-gray-800/50 rounded-lg p-8 text-gray-400">
        <div className="text-blue-500 mb-6">
            {React.cloneElement(icon, {className: 'h-24 w-24'})}
        </div>
        <h2 className="text-4xl font-bold text-white mb-3">{title}</h2>
        <p className="max-w-md">{message}</p>
    </div>
);

export const NotesView: React.FC = () => {
    const {notes, updateNote, deleteNote} = useNotes();
    const {selectedNoteId, setSelectedNoteId} = useView();
    const {settings} = useSettings();
    const selectedNote = notes.find((note) => note.id === selectedNoteId);

    const handleDeleteNote = (id: string) => {
        // The selection logic needs to be here, not in the service
        if (selectedNoteId === id) {
            const remainingNotes = notes.filter((n) => n.id !== id);
            if (remainingNotes.length > 0) {
                // As per original logic, select the most recently updated note
                const mostRecentNote = remainingNotes.sort(
                    (a, b) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
                )[0];
                setSelectedNoteId(mostRecentNote.id);
            } else {
                setSelectedNoteId(null);
            }
        }
        deleteNote(id);
    };

    if (!selectedNote) {
        return (
            <PlaceholderView
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
            onDelete={handleDeleteNote}
            settings={settings}
        />
    );
};

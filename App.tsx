import React, {useEffect} from 'react';
import {Header} from './components/Header';
import {Sidebar} from './components/Sidebar';
import {MainView} from './components/MainView';
import {useNotesContext as useNotes} from './components/contexts/NotesContext';
import {useView} from './components/contexts/ViewContext';

const App: React.FC = () => {
    const {notes, addNote, deleteNote, notesLoading} = useNotes();
    const {activeView, setActiveView, selectedNoteId, setSelectedNoteId} = useView();

    // Auto-select the most recent note on load or when switching to 'notes' view
    useEffect(() => {
        if (activeView === 'notes' && !notesLoading && selectedNoteId === null && notes.length > 0) {
            const sortedNotes = notes.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setSelectedNoteId(sortedNotes[0].id);
        }
    }, [notesLoading, notes, selectedNoteId, activeView, setSelectedNoteId]);

    const handleNewNote = () => {
        const newNote = addNote();
        setSelectedNoteId(newNote.id);
        setActiveView('notes');
    };

    const handleDeleteNote = (id: string) => {
        deleteNote(id);
        if (selectedNoteId === id) {
            const remainingNotes = notes.filter(n => n.id !== id);
            const sortedNotes = remainingNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setSelectedNoteId(sortedNotes.length > 0 ? sortedNotes[0].id : null);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
            <Header
                onNewNote={handleNewNote}
            />
            <div className="flex flex-1 overflow-hidden">
                {activeView === 'notes' && (
                    <div className="w-[320px] flex-shrink-0 bg-gray-900 border-r border-gray-700/50">
                        <Sidebar/>
                    </div>
                )}

                <main className="flex-1 p-3 overflow-hidden">
                    <MainView/>
                </main>
            </div>
        </div>
    );
};

export default App;
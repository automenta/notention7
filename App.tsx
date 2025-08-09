import React from 'react';
import {Header} from './components/Header';
import {useNotesContext} from './components/contexts/NotesContext';
import {MainLayout} from './components/MainLayout';
import {useAppContext} from './components/contexts/AppContext';

const App: React.FC = () => {
    const {addNote} = useNotesContext();
    const {setActiveView, setSelectedNoteId} = useAppContext();

    const handleNewNote = () => {
        const newNote = addNote();
        setSelectedNoteId(newNote.id);
        setActiveView('notes');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
            <Header onNewNote={handleNewNote}/>
            <MainLayout/>
        </div>
    );
};

export default App;

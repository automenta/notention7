import React from 'react';
import {Header} from './components/Header';
import {useNotesContext} from './components/contexts/NotesContext';
import {useViewContext} from './components/contexts/ViewContext';
import {useAutoSelectNote} from './hooks/useAutoSelectNote';
import {MainLayout} from './components/MainLayout';

const App: React.FC = () => {
    const {addNote} = useNotesContext();
    const {setActiveView, setSelectedNoteId} = useViewContext();

    useAutoSelectNote();

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

import React from 'react';
import {Header} from './components/Header';
import {MainLayout} from './components/MainLayout';
import {useNoteManagement} from './hooks/useNoteManagement';

const App: React.FC = () => {
    const {createAndSelectNewNote} = useNoteManagement();

    return (
        <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
            <Header onNewNote={createAndSelectNewNote}/>
            <MainLayout/>
        </div>
    );
};

export default App;

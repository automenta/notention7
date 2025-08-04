
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { SettingsView } from './components/SettingsView';
import { NetworkView } from './components/NetworkView';
import { ChatView } from './components/ChatView';
import { OntologyView } from './components/OntologyView';
import { MapView } from './components/MapView';
import { useLocalForage } from './hooks/useLocalForage';
import { useNotes } from './hooks/useNotes';
import type { AppSettings, View } from './types';
import { LoadingSpinner, CubeTransparentIcon } from './components/icons';
import { DEFAULT_ONTOLOGY } from './utils/ontology.default';

interface PlaceholderViewProps {
    icon: React.ReactElement<{ className?: string }>;
    title: string;
    message: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ icon, title, message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-800/50 rounded-lg p-8 text-gray-400">
        <div className="text-blue-500 mb-6">
            {React.cloneElement(icon, { className: 'h-24 w-24' })}
        </div>
        <h2 className="text-4xl font-bold text-white mb-3">{title}</h2>
        <p className="max-w-md">{message}</p>
    </div>
);

const App: React.FC = () => {
    const { notes, addNote, updateNote, deleteNote, notesLoading } = useNotes();
    const [settings, setSettings, settingsLoading] = useLocalForage<AppSettings>('notention-settings', {
        aiEnabled: false,
        theme: 'dark',
        nostr: {
            privkey: null,
        },
        ontology: [],
    });
    const [activeView, setActiveView] = useState<View>('notes');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    // Populate with default ontology on first run
    useEffect(() => {
        if (!settingsLoading && (!settings.ontology || settings.ontology.length === 0)) {
            setSettings(s => ({...s, ontology: DEFAULT_ONTOLOGY}));
        }
    }, [settings.ontology, settingsLoading, setSettings]);
    
    // Auto-select the most recent note on load or when switching to 'notes' view
    useEffect(() => {
        if (activeView === 'notes' && !notesLoading && selectedNoteId === null && notes.length > 0) {
            const sortedNotes = notes.slice().sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setSelectedNoteId(sortedNotes[0].id);
        }
    }, [notesLoading, notes, selectedNoteId, activeView]);

    const handleNewNote = () => {
        const newNote = addNote();
        setSelectedNoteId(newNote.id);
        setActiveView('notes');
    };

    const handleDeleteNote = (id: string) => {
        deleteNote(id);
        if (selectedNoteId === id) {
            const remainingNotes = notes.filter(n => n.id !== id);
            const sortedNotes = remainingNotes.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setSelectedNoteId(sortedNotes.length > 0 ? sortedNotes[0].id : null);
        }
    };
    
    const handleSelectView = (view: View) => {
        setActiveView(view);
    };

    const handleSelectNoteFromOtherView = (id: string) => {
        setActiveView('notes');
        setSelectedNoteId(id);
    }

    const selectedNote = notes.find(note => note.id === selectedNoteId);

    const renderMainView = () => {
        if (notesLoading || settingsLoading) {
            return <div className="flex justify-center items-center h-full"><LoadingSpinner className="h-12 w-12"/></div>;
        }

        switch (activeView) {
            case 'notes':
                return selectedNote ? (
                    <NoteEditor 
                        key={selectedNote.id} // Re-mount component when note changes
                        note={selectedNote} 
                        onSave={updateNote} 
                        onDelete={handleDeleteNote}
                        settings={settings}
                    />
                ) : (
                    <PlaceholderView 
                        icon={<CubeTransparentIcon/>}
                        title="No Note Selected"
                        message="Create a new note or select one from the list to get started."
                    />
                );
            case 'ontology':
                 return <OntologyView ontology={settings.ontology} />;
            case 'map':
                return <MapView notes={notes} onSelectNote={handleSelectNoteFromOtherView} />;
            case 'network':
                return <NetworkView settings={settings} setSettings={setSettings} onNavigateToSettings={() => setActiveView('settings')} />;
            case 'chat':
                return <ChatView settings={settings} setSettings={setSettings} />;
            case 'settings':
                return <SettingsView settings={settings} setSettings={setSettings} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
            <Header
                activeView={activeView}
                onSelectView={handleSelectView}
                onNewNote={handleNewNote}
            />
            <div className="flex flex-1 overflow-hidden">
                {activeView === 'notes' && (
                    <div className="w-[320px] flex-shrink-0 bg-gray-900 border-r border-gray-700/50">
                        <Sidebar
                            notes={notes}
                            selectedNoteId={selectedNoteId}
                            onSelectNote={setSelectedNoteId}
                            onDeleteNote={handleDeleteNote}
                        />
                    </div>
                )}

                <main className="flex-1 p-3 overflow-hidden">
                    {renderMainView()}
                </main>
            </div>
        </div>
    );
};

export default App;
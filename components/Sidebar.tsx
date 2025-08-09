import React, {useState} from 'react';
import {Search} from './sidebar/Search';
import {useNotesContext} from '../hooks/useNotesContext';
import {useViewContext} from '../hooks/useViewContext';
import {NoteListItem} from './sidebar/NoteListItem';
import {useSortedFilteredNotes} from '../hooks/useSortedFilteredNotes';

type SortOrder =
    | 'updatedAt_desc'
    | 'updatedAt_asc'
    | 'createdAt_desc'
    | 'createdAt_asc'
    | 'title_asc'
    | 'title_desc';

export const Sidebar: React.FC = () => {
    const {notes, deleteNote} = useNotesContext();
    const {selectedNoteId, setSelectedNoteId} = useViewContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('updatedAt_desc');

    const sortedNotes = useSortedFilteredNotes(notes, searchTerm, sortOrder);

    const handleDeleteNote = (noteIdToDelete: string) => {
        if (selectedNoteId === noteIdToDelete) {
            const currentIndex = sortedNotes.findIndex(
                (n) => n.id === noteIdToDelete
            );
            const nextNote =
                sortedNotes[currentIndex + 1] || sortedNotes[currentIndex - 1] || null;
            setSelectedNoteId(nextNote ? nextNote.id : null);
        }
        deleteNote(noteIdToDelete);
    };

    return (
        <div className="bg-gray-900 flex flex-col h-full">
            <div className="p-4 flex-shrink-0 border-b border-gray-700/50 space-y-4">
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            </div>

            <div className="p-2 flex-shrink-0 border-b border-gray-700/50">
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-1.5 px-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="updatedAt_desc">Sort: Modified (Newest)</option>
                    <option value="updatedAt_asc">Sort: Modified (Oldest)</option>
                    <option value="createdAt_desc">Sort: Created (Newest)</option>
                    <option value="createdAt_asc">Sort: Created (Oldest)</option>
                    <option value="title_asc">Sort: Title (A-Z)</option>
                    <option value="title_desc">Sort: Title (Z-A)</option>
                </select>
            </div>

            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                {sortedNotes.length > 0 ? (
                    sortedNotes.map((note) => (
                        <NoteListItem
                            key={note.id}
                            note={note}
                            isSelected={selectedNoteId === note.id}
                            onSelect={() => setSelectedNoteId(note.id)}
                            onDelete={() => handleDeleteNote(note.id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 px-4 text-sm text-gray-500">
                        {searchTerm
                            ? 'No notes match your search.'
                            : 'No notes yet. Create one!'}
                    </div>
                )}
            </div>
        </div>
    );
};

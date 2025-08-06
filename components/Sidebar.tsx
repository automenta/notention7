import React, { useMemo, useState } from 'react';
import type { Note } from '../types';
import { TrashIcon, WorldIcon } from './icons';
import { getTextFromHtml } from '../utils/nostr';
import { Search } from './sidebar/Search';
import { useNotes } from './contexts/NotesContext';
import { useView } from './contexts/ViewContext';

type SortOrder =
  | 'updatedAt_desc'
  | 'updatedAt_asc'
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'title_asc'
  | 'title_desc';

const NoteListItem: React.FC<{
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ note, isSelected, onSelect, onDelete }) => {
  const contentPreview = React.useMemo(() => {
    return getTextFromHtml(note.content) || 'No content';
  }, [note.content]);

  return (
    <div
      onClick={onSelect}
      className={`group flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-600/30' : 'hover:bg-gray-800'
      }`}
    >
      <div className="flex-1 overflow-hidden flex items-center gap-3">
        {note.nostrEventId && note.publishedAt && (
          <span
            title={`Published on Nostr at ${new Date(note.publishedAt).toLocaleString()}`}
          >
            <WorldIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
          </span>
        )}
        <div className="flex-1 overflow-hidden">
          <h3
            className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}
          >
            {note.title || 'Untitled Note'}
          </h3>
          <p className="text-sm text-gray-400 truncate">{contentPreview}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="ml-2 p-1 text-gray-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-900/50 hover:text-red-400 transition-opacity"
        title="Delete Note"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { notes, deleteNote } = useNotes();
  const { selectedNoteId, setSelectedNoteId } = useView();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('updatedAt_desc');

  const handleDeleteNote = (noteIdToDelete: string) => {
    if (selectedNoteId === noteIdToDelete) {
      const remainingNotes = notes.filter((n) => n.id !== noteIdToDelete);
      if (remainingNotes.length > 0) {
        // Select the most recently updated note
        const mostRecentNote = remainingNotes.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        setSelectedNoteId(mostRecentNote.id);
      } else {
        setSelectedNoteId(null);
      }
    }
    deleteNote(noteIdToDelete);
  };

  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return notes;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const searchParts: string[] =
      lowerCaseSearchTerm.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const textQueries = searchParts
      .filter((p) => !p.startsWith('#') && !p.includes(':'))
      .map((p) => p.replace(/"/g, ''));
    const tagQueries = searchParts
      .filter((p) => p.startsWith('#'))
      .map((p) => p.substring(1));
    const propQueries = searchParts
      .filter((p) => p.includes(':'))
      .map((p) => {
        const [key, value] = p.split(':', 2);
        return { key, value: value.replace(/"/g, '') };
      });

    return notes.filter((note) => {
      const noteContentText = getTextFromHtml(note.content).toLowerCase();
      const noteTitle = note.title.toLowerCase();

      const textMatch = textQueries.every(
        (query) => noteTitle.includes(query) || noteContentText.includes(query)
      );

      const tagMatch = tagQueries.every((query) =>
        (note.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );

      const propMatch = propQueries.every((query) =>
        (note.properties || []).some(
          (prop) =>
            prop.key.toLowerCase() === query.key &&
            prop.values.some((val) => val.toLowerCase().includes(query.value))
        )
      );

      return textMatch && tagMatch && propMatch;
    });
  }, [notes, searchTerm]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      switch (sortOrder) {
        case 'updatedAt_desc':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case 'updatedAt_asc':
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case 'createdAt_desc':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'createdAt_asc':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [filteredNotes, sortOrder]);

  return (
    <div className="bg-gray-900 flex flex-col h-full">
      <div className="p-4 flex-shrink-0 border-b border-gray-700/50 space-y-4">
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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

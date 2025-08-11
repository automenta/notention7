import React, { useMemo, useEffect } from 'react';
import { useNotesContext } from '../contexts/NotesContext';
import { LoadingSpinner, SearchIcon } from '../icons';
import { useNostrProfile } from '@/hooks/useNostrProfile';
import { NostrEventCard } from '../network/NostrEventCard';
import { getTextFromHtml } from '@/utils/dom';
import { useDiscoverySearch } from '@/hooks/useDiscoverySearch';
import type { Note } from '@/types';
import { useSettingsContext } from '../contexts/settings.context';
import { useViewContext } from '../contexts/view.context';
import { useOntologyIndex } from '@/hooks/useOntologyIndex';
import { parseNostrEventContent } from '@/utils/discovery';

// A new, simplified list item for query notes
const QueryNoteItem: React.FC<{
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ note, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`p-3 rounded-lg cursor-pointer transition-colors ${
      isSelected
        ? 'bg-blue-600/30'
        : 'bg-gray-700/50 hover:bg-gray-700'
    }`}
  >
    <h3 className="font-semibold text-white truncate">{note.title || 'Untitled Note'}</h3>
    <p className="text-sm text-gray-400 truncate">{getTextFromHtml(note.content)}</p>
  </div>
);

export const DiscoveryView: React.FC = () => {
  const { notes } = useNotesContext();
  const { settings } = useSettingsContext();
  const { selectedNoteId, setSelectedNoteId } = useViewContext();
  const { propertyTypes: ontologyIndex } = useOntologyIndex(settings.ontology);

  // Find notes that are 'imaginary' by checking against the ontology
  const queryNotes = useMemo(() => {
    return notes.filter(note =>
      note.properties.some(p => {
        const attribute = ontologyIndex.get(p.key);
        return !!attribute?.operators.imaginary.includes(p.operator);
      })
    );
  }, [notes, ontologyIndex]);

  // Auto-select the first query note if none is selected
  useEffect(() => {
    if (!selectedNoteId && queryNotes.length > 0) {
      setSelectedNoteId(queryNotes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryNotes, selectedNoteId]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const { results, searchState, searchCriteria, handleSearch } =
    useDiscoverySearch(selectedNote, notes);

  const authorPubkeys = useMemo(
    () => [...new Set(results.map((e) => e.pubkey))],
    [results]
  );
  const profiles = useNostrProfile(authorPubkeys);

  return (
    <div className="flex h-full gap-6">
      {/* Left Column: Query Notes */}
      <div className="w-1/3 flex-shrink-0 bg-gray-900/50 p-4 rounded-lg flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4">Your Queries</h2>
        <div className="space-y-2 overflow-y-auto">
          {queryNotes.length > 0 ? (
            queryNotes.map((note) => (
              <QueryNoteItem
                key={note.id}
                note={note}
                isSelected={note.id === selectedNoteId}
                onSelect={() => setSelectedNoteId(note.id)}
              />
            ))
          ) : (
            <div className="text-center p-6 text-gray-500">
              <p>No query notes found.</p>
              <p className="text-sm">Create a note with a conditional property (e.g., &apos;[budget &lt; 5000]&apos;) to start discovering.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="flex-1 bg-gray-800/50 p-8 rounded-lg overflow-y-auto">
        {!selectedNote ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <SearchIcon className="h-16 w-16 mb-4" />
            <h2 className="text-2xl font-bold">Select a Query</h2>
            <p>Select one of your query notes from the left to find matching notes on the network.</p>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Discovery Results for: &quot;{selectedNote.title || 'Untitled Note'}&quot;
            </h1>
            <div className="p-4 my-4 bg-gray-700/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">Active Search Criteria</h3>
                <button
                  onClick={handleSearch}
                  disabled={searchState === 'searching' || searchCriteria.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <SearchIcon className="h-5 w-5" />
                  {searchState === 'searching' ? 'Searching...' : 'Find Matching Notes'}
                </button>
              </div>
              {searchCriteria.length > 0 ? (
                <ul className="space-y-1">
                  {searchCriteria.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <span className="font-mono bg-gray-900 px-2 py-1 rounded text-sm">{c.key}</span>
                      <span className="font-mono text-blue-400">{c.op}</span>
                      <span className="font-mono bg-gray-900 px-2 py-1 rounded text-sm">{c.values.join(', ')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="text-gray-400">This note has no conditional properties to search by.</p>
              )}
            </div>

            {searchState === 'searching' && (
              <div className="flex justify-center items-center h-48">
                <LoadingSpinner className="h-8 w-8 text-gray-400 animate-spin" />
                <p className="ml-4 text-gray-400">Searching the network...</p>
              </div>
            )}

            {searchState === 'results' && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Found {results.length} matching note(s)
                </h2>
                <div className="space-y-4">
                  {results.length > 0 ? (
                    results.map((event) => {
                      const { title, contentPreview } = parseNostrEventContent(event.content);
                      return (
                        <NostrEventCard
                          key={event.id}
                          event={event}
                          profile={profiles[event.pubkey]}
                          matchingCriteria={searchCriteria}
                          title={title}
                          contentPreview={contentPreview}
                        />
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-8">No results found for these criteria.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

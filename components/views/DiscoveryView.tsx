import React, { useEffect, useMemo, useState } from 'react';
import { useNotesContext } from '../../hooks/useNotesContext';
import { NoteListItem } from '../sidebar/NoteListItem';
import {
  findMatchingNotes,
  NOTENTION_KIND,
} from '../../services/nostrService';
import type { NostrEvent } from '../../types';
import { LoadingSpinner } from '../icons';
import { useNostrProfile } from '../../hooks/useNostrProfile';
import { NostrEventCard } from '../network/NostrEventCard';
import { getTextFromHtml } from '../../utils/nostr';

export const DiscoveryView: React.FC = () => {
  const { notes } = useNotesContext();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [results, setResults] = useState<NostrEvent[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const authorPubkeys = useMemo(
    () => [...new Set(results.map((e) => e.pubkey))],
    [results]
  );
  const profiles = useNostrProfile(authorPubkeys);

  useEffect(() => {
    const performSearch = async () => {
      if (!selectedNote) return;

      setIsSearching(true);
      setResults([]);

      // Simple mapping: find 'real' properties that match the 'imaginary' ones.
      const p_tags: string[][] = selectedNote.properties
        .filter((p) => p.key === 'looking-for') // Find query properties
        .map((p) => {
          // Map 'looking-for' to the 'service' key for the query
          return ['p', 'service', p.op, ...p.values];
        });

      if (p_tags.length === 0) {
        setIsSearching(false);
        return;
      }

      const foundEvents = await findMatchingNotes({
        kinds: [NOTENTION_KIND],
      }); // Query all for now, then filter client-side

      const matchingEvents = foundEvents.filter((event) => {
        // Exclude our own note from results
        const dTag = event.tags.find(t => t[0] === 'd');
        if (dTag && notes.some(n => n.id === dTag[1])) {
            return false;
        }

        // Naive client-side filtering
        return p_tags.every((p_tag) => {
          return event.tags.some(
            (event_tag) =>
              event_tag[0] === 'p' &&
              event_tag[1] === p_tag[1] && // key matches
              event_tag[2] === p_tag[2] && // op matches ('is')
              event_tag[3] === p_tag[3] // value matches
          );
        });
      });

      setResults(matchingEvents);
      setIsSearching(false);
    };

    if (selectedNoteId) {
      performSearch();
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [selectedNoteId, selectedNote, notes]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Discovery</h1>
        <p className="text-gray-400 mb-8">
          {selectedNote
            ? `Finding notes related to: "${selectedNote.title || 'Untitled Note'}"`
            : 'Select one of your notes to find semantically related notes from the network.'}
        </p>

        {selectedNote ? (
          <div>
            <button
              onClick={() => setSelectedNoteId(null)}
              className="mb-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              &larr; Back to Note Selection
            </button>

            {isSearching ? (
              <div className="flex justify-center items-center h-48">
                <LoadingSpinner className="h-8 w-8 text-gray-400" />
                <p className="ml-4 text-gray-400">Searching the network...</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Found {results.length} matching note(s)
                </h2>
                <div className="space-y-4">
                  {results.length > 0 ? (
                    results.map((event) => {
                      let contentPreview = 'Could not parse content.';
                      try {
                        // Notention events have stringified JSON in their content field.
                        const contentHtml = JSON.parse(event.content);
                        contentPreview = getTextFromHtml(contentHtml);
                      } catch (e) {
                        /* Do nothing, preview will show error */
                      }

                      return (
                        <NostrEventCard
                          key={event.id}
                          event={event}
                          profile={profiles[event.pubkey]}
                          contentPreview={contentPreview}
                        />
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No results found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={() => setSelectedNoteId(note.id)}
                onDelete={() => {
                  /* No-op in this view */
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

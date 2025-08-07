import React, { useEffect, useMemo, useState } from 'react';
import { useNotesContext } from '../../hooks/useNotesContext';
import { NoteListItem } from '../sidebar/NoteListItem';
import {
  findMatchingNotes,
  NOTENTION_KIND,
} from '../../services/nostrService';
import type { NostrEvent, Property } from '../../types';
import { LoadingSpinner } from '../icons';
import { useNostrProfile } from '../../hooks/useNostrProfile';
import { NostrEventCard } from '../network/NostrEventCard';
import { getTextFromDelta } from '../../utils/nostr';
import { IMAGINARY_TO_REAL_MAP } from '../../utils/discovery';

type SearchState = 'idle' | 'ready' | 'searching' | 'results';
type SearchCriterion = { key: string; op: string; values: readonly string[] };

const SearchCriteriaSummary: React.FC<{ criteria: SearchCriterion[] }> = ({
  criteria,
}) => {
  if (criteria.length === 0) {
    return (
      <div className="p-4 my-4 text-center bg-gray-700/50 rounded-lg">
        <p className="text-gray-400">
          This note has no searchable properties.
        </p>
        <p className="text-sm text-gray-500">
          Try adding a property like `[looking-for:is:some-service]` to enable
          discovery.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 my-4 bg-gray-700/50 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-2">Search Criteria</h3>
      <ul className="space-y-1">
        {criteria.map((c, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-300">
            <span className="font-mono bg-gray-900 px-2 py-1 rounded text-sm">
              {c.key}
            </span>
            <span className="font-mono text-blue-400">
              {c.op === 'less than'
                ? '<'
                : c.op === 'greater than'
                  ? '>'
                  : c.op}
            </span>
            <span className="font-mono bg-gray-900 px-2 py-1 rounded text-sm">
              {c.values.join(', ')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const DiscoveryView: React.FC = () => {
  const { notes } = useNotesContext();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [results, setResults] = useState<NostrEvent[]>([]);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriterion[]>([]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const authorPubkeys = useMemo(
    () => [...new Set(results.map((e) => e.pubkey))],
    [results]
  );
  const profiles = useNostrProfile(authorPubkeys);

  // Effect to derive search criteria when a note is selected
  useEffect(() => {
    if (selectedNote) {
      const criteria = selectedNote.properties
        .map((p) => {
          const realKey = IMAGINARY_TO_REAL_MAP[p.key] || p.key;
          // For now, only support 'is', 'less than', and 'greater than'
          if (['is', 'less than', 'greater than'].includes(p.op)) {
            return { key: realKey, op: p.op, values: p.values };
          }
          return null;
        })
        .filter((c): c is SearchCriterion => c !== null);

      setSearchCriteria(criteria);
      setResults([]);
      setSearchState('ready');
    } else {
      setSearchCriteria([]);
      setResults([]);
      setSearchState('idle');
    }
  }, [selectedNote]);

  const handleSearch = async () => {
    if (searchCriteria.length === 0) return;

    setSearchState('searching');
    setResults([]);

    const realKeys = [...new Set(searchCriteria.map((c) => c.key))];
    const filter = {
      kinds: [NOTENTION_KIND],
      '#p': realKeys,
    };
    const foundEvents = await findMatchingNotes(filter);

    const matchingEvents = foundEvents.filter((event) => {
      const dTag = event.tags.find((t) => t[0] === 'd');
      if (dTag && notes.some((n) => n.id === dTag[1])) {
        return false;
      }

      return searchCriteria.every((criterion) => {
        const matchingTag = event.tags.find(
          (tag) => tag[0] === 'p' && tag[1] === criterion.key
        );

        if (!matchingTag) return false;

        const [_, key, op, ...values] = matchingTag;

        switch (criterion.op) {
          case 'is':
            return (
              op === 'is' &&
              criterion.values.every((v, i) => v === values[i])
            );
          case 'less than': {
            const criterionValue = parseFloat(criterion.values[0]);
            const eventValue = parseFloat(values[0]);
            return op === 'is' && !isNaN(criterionValue) && !isNaN(eventValue) && eventValue < criterionValue;
          }
          case 'greater than': {
            const criterionValue = parseFloat(criterion.values[0]);
            const eventValue = parseFloat(values[0]);
            return op === 'is' && !isNaN(criterionValue) && !isNaN(eventValue) && eventValue > criterionValue;
          }
          default:
            return false;
        }
      });
    });

    setResults(matchingEvents);
    setSearchState('results');
  };

  const handleReset = () => {
    setSelectedNoteId(null);
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Discovery</h1>
        <p className="text-gray-400 mb-8">
          {selectedNote
            ? `Finding notes related to: "${selectedNote.title || 'Untitled Note'}"`
            : 'Select one of your notes to find semantically related notes from the network.'}
        </p>

        {!selectedNote && (
          <div className="space-y-2">
            {notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={false}
                onSelect={() => setSelectedNoteId(note.id)}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}

        {selectedNote && (
          <div>
            <button
              onClick={handleReset}
              className="mb-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              &larr; Back to Note Selection
            </button>

            <SearchCriteriaSummary criteria={searchCriteria} />

            <button
              onClick={handleSearch}
              disabled={searchState !== 'ready' || searchCriteria.length === 0}
              className="w-full py-3 text-lg font-bold rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {searchState === 'searching' ? 'Searching...' : 'Find Matching Notes'}
            </button>
          </div>
        )}

        {searchState === 'searching' && (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner className="h-8 w-8 text-gray-400" />
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
                  let contentPreview = 'Could not parse content.';
                  try {
                    const contentDelta = JSON.parse(event.content);
                    contentPreview = getTextFromDelta(contentDelta);
                  } catch (e) {
                    /* Do nothing */
                  }
                  return (
                    <NostrEventCard
                      key={event.id}
                      event={event}
                      profile={profiles[event.pubkey]}
                      contentPreview={contentPreview}
                      matchingCriteria={searchCriteria}
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
    </div>
  );
};

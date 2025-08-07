import { useState, useEffect, useMemo } from 'react';
import type { Note, NostrEvent } from '../types';
import { findMatchingNotes, NOTENTION_KIND } from '../services/nostrService';
import { IMAGINARY_TO_REAL_MAP } from '../utils/discovery';

type SearchState = 'idle' | 'ready' | 'searching' | 'results';
type SearchCriterion = { key: string; op: string; values: readonly string[] };

export const useDiscoverySearch = (
  selectedNote: Note | undefined,
  localNotes: Note[]
) => {
  const [results, setResults] = useState<NostrEvent[]>([]);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriterion[]>([]);

  // Effect to derive search criteria when a note is selected
  useEffect(() => {
    if (selectedNote) {
      const criteria = selectedNote.properties
        .map((p) => {
          const realKey = IMAGINARY_TO_REAL_MAP[p.key] || p.key;
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

    const filter: {
      kinds: number[];
      limit: number;
      '#p'?: string[][];
    } = {
      kinds: [NOTENTION_KIND],
      limit: 200,
    };

    const pTags: string[][] = [];
    searchCriteria.forEach((criterion) => {
      if (criterion.op === 'is') {
        // For 'is' operator, create a specific tag filter
        pTags.push([criterion.key, 'is', ...criterion.values]);
      } else {
        // For range operators, filter by key only at the relay level
        pTags.push([criterion.key]);
      }
    });

    if (pTags.length > 0) {
      filter['#p'] = pTags;
    }

    const foundEvents = await findMatchingNotes(filter);

    const matchingEvents = foundEvents.filter((event) => {
      const dTag = event.tags.find((t) => t[0] === 'd');
      if (dTag && localNotes.some((n) => n.id === dTag[1])) {
        return false; // Exclude user's own notes
      }

      // Final client-side filtering for criteria that relays can't handle (e.g., range operators)
      return searchCriteria.every((criterion) => {
        // 'is' operator is already handled by the relay filter, so we can skip the check
        if (criterion.op === 'is') {
          return true;
        }

        const matchingTag = event.tags.find(
          (tag) => tag[0] === 'p' && tag[1] === criterion.key
        );

        if (!matchingTag) {
          // This should ideally not happen for range queries if the relay works correctly,
          // but as a safeguard, we return false.
          return false;
        }

        const [_, key, op, ...values] = matchingTag;

        // For range queries, the client must perform the final comparison.
        // We only expect events with 'is' operator from other clients' "real" notes.
        if (op !== 'is') return false;

        switch (criterion.op) {
          case 'less than': {
            const criterionValue = parseFloat(criterion.values[0]);
            const eventValue = parseFloat(values[0]);
            return !isNaN(criterionValue) && !isNaN(eventValue) && eventValue < criterionValue;
          }
          case 'greater than': {
            const criterionValue = parseFloat(criterion.values[0]);
            const eventValue = parseFloat(values[0]);
            return !isNaN(criterionValue) && !isNaN(eventValue) && eventValue > criterionValue;
          }
          default:
            // Should not happen as we already handled 'is'
            return false;
        }
      });
    });

    setResults(matchingEvents);
    setSearchState('results');
  };

  return { results, searchState, searchCriteria, handleSearch };
};

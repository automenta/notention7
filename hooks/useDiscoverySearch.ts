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

    const filter = {
      kinds: [NOTENTION_KIND],
      limit: 200,
    };
    const foundEvents = await findMatchingNotes(filter);

    const matchingEvents = foundEvents.filter((event) => {
      const dTag = event.tags.find((t) => t[0] === 'd');
      if (dTag && localNotes.some((n) => n.id === dTag[1])) {
        return false; // Exclude user's own notes
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

  return { results, searchState, searchCriteria, handleSearch };
};

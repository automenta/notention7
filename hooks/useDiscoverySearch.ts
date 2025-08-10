import {useCallback, useEffect, useState} from 'react';
import type {NostrEvent, Note, Property} from '@/types';
import {nostrService, NOTENTION_KIND} from '../services/NostrService';
import {IMAGINARY_TO_REAL_MAP} from '../utils/discovery';
import {useOntologyIndex} from './useOntologyIndex';
import {matchNotes} from '../utils/noteSemantics';
import {useAppContext} from '../components/contexts/AppContext';

type SearchState = 'idle' | 'ready' | 'searching' | 'results';

// The criteria sent to the relay. It's a subset of what we can query locally.
type RelaySearchCriterion = { key: string; op: string; values: readonly string[] };

export const useDiscoverySearch = (
    selectedNote: Note | undefined,
    localNotes: Note[],
) => {
    const [results, setResults] = useState<NostrEvent[]>([]);
    const [searchState, setSearchState] = useState<SearchState>('idle');
    const [relayCriteria, setRelayCriteria] = useState<RelaySearchCriterion[]>([]);
    const {settings} = useAppContext();
    const {propertyTypes: ontologyIndex} = useOntologyIndex(settings.ontology);

    // Effect to derive search criteria when a note is selected
    useEffect(() => {
        if (selectedNote) {
            // This criteria is only for the initial Nostr query.
            // The full client-side check will use the complete properties.
            const criteria = selectedNote.properties
                .map((p) => {
                    const realKey = IMAGINARY_TO_REAL_MAP[p.key] || p.key;
                    // Relays can only effectively filter by 'is' or presence of a key.
                    if (['is', 'less than', 'greater than', 'between'].includes(p.operator)) {
                        return {key: realKey, op: p.operator, values: p.values};
                    }
                    return null;
                })
                .filter((c): c is RelaySearchCriterion => c !== null);

            setRelayCriteria(criteria);
            setResults([]);
            setSearchState('ready');
        } else {
            setRelayCriteria([]);
            setResults([]);
            setSearchState('idle');
        }
    }, [selectedNote]);

    const handleSearch = useCallback(async () => {
        if (!selectedNote || relayCriteria.length === 0) return;

        setSearchState('searching');
        setResults([]);

        // Construct the relay filter. For range queries, we can only filter by key,
        // and must do the full comparison on the client.
        const pTags: string[][] = [];
        relayCriteria.forEach((criterion) => {
            if (criterion.op === 'is') {
                pTags.push([criterion.key, 'is', ...criterion.values]);
            } else {
                pTags.push([criterion.key]);
            }
        });

        const filter = {
            kinds: [NOTENTION_KIND],
            limit: 200,
            ...(pTags.length > 0 && {'#p': pTags}),
        };

        const foundEvents = await nostrService.findMatchingNotes(filter);

        // Map the query properties to their "real" counterparts for matching.
        const queryPropertiesWithMappedKeys: Property[] = selectedNote.properties.map(
            (p) => ({
                ...p,
                key: IMAGINARY_TO_REAL_MAP[p.key] || p.key,
            }),
        );

        const matchingEvents = foundEvents.filter((event) => {
            // Exclude own notes from results
            const dTag = event.tags.find((t) => t[0] === 'd');
            if (dTag && localNotes.some((n) => n.id === dTag[1])) {
                return false;
            }

            // Re-construct the "real" properties from the event's tags
            const sourceProperties: Property[] = event.tags
                .filter((tag) => tag[0] === 'p' && tag[1] && tag[2])
                .map(([, key, op, ...values]) => ({key, operator: op, values}));

            // Use the robust matchNotes function for final, accurate client-side filtering.
            return matchNotes(
                sourceProperties,
                queryPropertiesWithMappedKeys,
                ontologyIndex,
            );
        });

        setResults(matchingEvents);
        setSearchState('results');
    }, [selectedNote, relayCriteria, localNotes, ontologyIndex]);

    return {results, searchState, searchCriteria: relayCriteria, handleSearch};
};

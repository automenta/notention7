import {act, renderHook, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useDiscoverySearch} from '@/hooks/useDiscoverySearch.ts';
import * as nostrService from '../../services/nostrService';
import * as ontologyHook from '../../hooks/useOntologyIndex';
import type {NostrEvent, Note, OntologyAttribute} from '@/types';

// Mock services and hooks
vi.mock('../../services/nostrService');
vi.mock('../../hooks/useOntologyIndex');

const mockOntologyIndex = new Map<string, OntologyAttribute>([
    ['service', {type: 'string', operators: {real: ['is'], imaginary: ['is']}}],
    ['price', {type: 'number', operators: {real: ['is'], imaginary: ['less than']}}],
]);

const mockQueryNote: Note = {
    id: 'query-note',
    title: 'Looking for a dev',
    content: '',
    tags: [],
    properties: [
        {key: 'looking-for', operator: 'is', values: ['web-dev']},
        {key: 'budget', operator: 'less than', values: ['100']},
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
};

// This event should match the query
const matchingEvent: NostrEvent = {
    id: 'matching-event',
    pubkey: 'a'.repeat(64),
    created_at: Math.floor(Date.now() / 1000),
    kind: 30019,
    tags: [
        ['p', 'service', 'is', 'web-dev'], // 'looking-for' maps to 'service'
        ['p', 'price', 'is', '90'],         // 'budget' maps to 'price', and 90 < 100
    ],
    content: JSON.stringify({title: 'Web Dev Available', content: '...'}),
    sig: 'sig1',
};

// This event should NOT match (price is too high)
const nonMatchingEvent: NostrEvent = {
    id: 'non-matching-event',
    pubkey: 'b'.repeat(64),
    created_at: Math.floor(Date.now() / 1000),
    kind: 30019,
    tags: [
        ['p', 'service', 'is', 'web-dev'],
        ['p', 'price', 'is', '200'], // 200 is not less than 100
    ],
    content: JSON.stringify({title: 'Expensive Dev', content: '...'}),
    sig: 'sig2',
};

describe('useDiscoverySearch', () => {
    beforeEach(() => {
        vi.mocked(ontologyHook.useOntologyIndex).mockReturnValue({
            ontologyIndex: mockOntologyIndex,
        } as any);

        vi.mocked(nostrService.findMatchingNotes).mockResolvedValue([
            matchingEvent,
            nonMatchingEvent,
        ]);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return only the notes that match the query after client-side filtering', async () => {
        const {result} = renderHook(() => useDiscoverySearch(mockQueryNote, []));

        // Wait for the useEffect to run and set the criteria
        await waitFor(() => {
            expect(result.current.searchCriteria.length).toBeGreaterThan(0);
        });

        await act(async () => {
            await result.current.handleSearch();
        });

        await waitFor(() => {
            expect(result.current.results).toHaveLength(1);
            expect(result.current.results[0].id).toBe('matching-event');
        });
    });
});

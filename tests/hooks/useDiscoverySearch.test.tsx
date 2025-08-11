import {act, renderHook, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useDiscoverySearch} from '@/hooks/useDiscoverySearch.ts';
import {nostrService} from '@/services/NostrService.ts';
import * as ontologyHook from '../../hooks/useOntologyIndex';
import type {NostrEvent, Note, OntologyAttribute} from '@/types';
import {SettingsContext, SettingsContextType} from '@/components/contexts/settings.context';
import {ViewContext, ViewContextType} from '@/components/contexts/view.context';
import {DEFAULT_ONTOLOGY} from '@/utils/ontology.default.ts';
import React from 'react';

// Mock services and hooks
vi.mock('@/services/NostrService', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        nostrService: {
            findMatchingNotes: vi.fn(),
        },
    };
});
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

const mockSettingsContextValue: SettingsContextType = {
    settings: {
        aiEnabled: false,
        geminiApiKey: null,
        theme: 'dark',
        nostr: {privkey: 'test-privkey'},
        ontology: DEFAULT_ONTOLOGY,
    },
    setSettings: vi.fn(),
    settingsLoading: false,
};

const mockViewContextValue: ViewContextType = {
    activeView: 'discovery',
    setActiveView: vi.fn(),
    selectedNoteId: 'note1',
    setSelectedNoteId: vi.fn(),
};

const TestWrapper = ({children}: { children: React.ReactNode }) => (
    <SettingsContext.Provider value={mockSettingsContextValue}>
        <ViewContext.Provider value={mockViewContextValue}>
            {children}
        </ViewContext.Provider>
    </SettingsContext.Provider>
);

describe('useDiscoverySearch', () => {
    beforeEach(() => {
        vi.mocked(ontologyHook.useOntologyIndex).mockReturnValue({
            allTags: [],
            allProperties: [],
            allTemplates: [],
            propertyTypes: mockOntologyIndex,
        });
        vi.mocked(nostrService.findMatchingNotes).mockResolvedValue([
            matchingEvent,
            nonMatchingEvent,
        ]);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return only the notes that match the query after client-side filtering', async () => {
        const {result} = renderHook(() => useDiscoverySearch(mockQueryNote, []), {
            wrapper: TestWrapper,
        });

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

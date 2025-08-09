import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {DiscoveryView} from '@/components/views/DiscoveryView.tsx';
import * as nostrService from '../../../services/nostrService';
import * as ontologyHook from '../../../hooks/useOntologyIndex';
import type {NostrEvent, Note, OntologyAttribute} from '@/types';
import {NotesContext} from '@/components/contexts/NotesContext.tsx';
import * as useNostrProfile from '../../../hooks/useNostrProfile';

// Mocks
vi.mock('../../../services/nostrService');
vi.mock('../../../hooks/useOntologyIndex');
vi.mock('../../../hooks/useNostrProfile');

const mockOntologyIndex = new Map<string, OntologyAttribute>([
    ['looking-for', {type: 'string', operators: {real: [], imaginary: ['is']}}],
    ['service', {type: 'string', operators: {real: ['is'], imaginary: []}}],
    ['budget', {type: 'number', operators: {real: [], imaginary: ['less than']}}],
    ['rate', {type: 'number', operators: {real: ['is'], imaginary: []}}],
]);

const mockQueryNote: Note = {
    id: 'note1',
    title: 'Looking for a web developer',
    content: '',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    tags: [],
    properties: [{key: 'looking-for', operator: 'is', values: ['web-dev']}],
};

const matchingEvent: NostrEvent = {
    id: 'event1',
    pubkey: 'a'.repeat(64), // Valid 64-char hex pubkey mock
    kind: 30019,
    sig: 'sig1',
    created_at: 0,
    tags: [['p', 'service', 'is', 'web-dev']],
    content: JSON.stringify({title: 'Web Dev Available', content: 'I am a dev'}),
};

const nonMatchingEvent: NostrEvent = {
    id: 'event2',
    pubkey: 'b'.repeat(64), // Valid 64-char hex pubkey mock
    kind: 30019,
    sig: 'sig2',
    created_at: 0,
    tags: [['p', 'service', 'is', 'mobile-dev']],
    content: JSON.stringify({title: 'Mobile Dev Available', content: '...'}),
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({children}) => (
    <NotesContext.Provider value={{notes: [mockQueryNote]} as any}>
        {children}
    </NotesContext.Provider>
);

describe('DiscoveryView', () => {
    beforeEach(() => {
        vi.mocked(ontologyHook.useOntologyIndex).mockReturnValue({
            ontologyIndex: mockOntologyIndex,
        } as any);
        vi.mocked(useNostrProfile.useNostrProfile).mockReturnValue({});
        vi.mocked(nostrService.findMatchingNotes).mockResolvedValue([
            matchingEvent,
            nonMatchingEvent,
        ]);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders the note list and allows selection', async () => {
        render(<DiscoveryView/>, {wrapper: TestWrapper});
        expect(screen.getByText('Looking for a web developer')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Looking for a web developer'));
        expect(
            await screen.findByText(/Finding notes related to/),
        ).toBeInTheDocument();
    });

    it('displays search criteria and allows searching', async () => {
        render(<DiscoveryView/>, {wrapper: TestWrapper});
        fireEvent.click(screen.getByText('Looking for a web developer'));

        const searchButton = await screen.findByRole('button', {
            name: /Find Matching Notes/i,
        });
        expect(searchButton).not.toBeDisabled();

        // Check that the summary is rendered, using the mapped key 'service'
        expect(screen.getByText('service')).toBeInTheDocument();
        expect(screen.getByText('is')).toBeInTheDocument();
        expect(screen.getByText('web-dev')).toBeInTheDocument();

        fireEvent.click(searchButton);
        expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    it('displays correctly filtered results after searching', async () => {
        render(<DiscoveryView/>, {wrapper: TestWrapper});
        fireEvent.click(screen.getByText('Looking for a web developer'));

        const searchButton = await screen.findByRole('button', {
            name: /Find Matching Notes/i,
        });
        fireEvent.click(searchButton);

        // After searching, only the matching event should be rendered
        expect(
            await screen.findByText('Found 1 matching note(s)'),
        ).toBeInTheDocument();
        expect(screen.getByText('Web Dev Available')).toBeInTheDocument();
        expect(
            screen.queryByText('Mobile Dev Available'),
        ).not.toBeInTheDocument();
    });
});

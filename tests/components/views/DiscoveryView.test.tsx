import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DiscoveryView } from '../../../components/views/DiscoveryView';
import * as nostrService from '../../../services/nostrService';
import { Note, NostrEvent } from '../../../types';
import { NotesContext } from '../../../components/contexts/notes';
import { ViewContext } from '../../../components/contexts/view';
import * as useNostrProfile from '../../../hooks/useNostrProfile';

// Mock nostrService
vi.mock('../../../services/nostrService', () => ({
  findMatchingNotes: vi.fn(),
  NOTENTION_KIND: 30019,
}));

// Mock useNostrProfile hook
vi.mock('../../../hooks/useNostrProfile');

const findMatchingNotesSpy = nostrService.findMatchingNotes as jest.Mock;
const useNostrProfileSpy = useNostrProfile.useNostrProfile as jest.Mock;

const mockNotes: Note[] = [
  {
    id: 'note1',
    title: 'Looking for a web developer',
    content: '{"ops":[{"insert":"test"}]}',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    properties: [
      { key: 'looking-for', op: 'is', values: ['Web Development'] },
      { key: 'budget', op: 'is', values: ['4000'] },
    ],
  },
  {
    id: 'note2',
    title: 'My Freelance Services',
    content: '{"ops":[{"insert":"test"}]}',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    properties: [{ key: 'service', op: 'is', values: ['Web Development'] }],
  },
  {
    id: 'note3',
    title: 'Looking for cheap services',
    content: '{"ops":[{"insert":"test"}]}',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    properties: [{ key: 'budget', op: 'less than', values: ['5000'] }],
  },
];

const mockEvent: NostrEvent = {
  id: 'event1',
  pubkey: 'a2fdef39a25ee7e2861d12a1491579a8af841a39038051016629471c7b8566a5',
  created_at: Math.floor(Date.now() / 1000),
  kind: 30019,
  tags: [
    ['p', 'service', 'is', 'Web Development'],
    ['p', 'price', 'is', '4000'],
  ],
  content: '{"ops":[{"insert":"I am a web developer"}]}',
  sig: 'sig1',
};

const mockEvent2: NostrEvent = {
    id: 'event2',
    pubkey: 'b2fdef39a25ee7e2861d12a1491579a8af841a39038051016629471c7b8566a5',
    created_at: Math.floor(Date.now() / 1000),
    kind: 30019,
    tags: [
        ['p', 'price', 'is', '4500'],
    ],
    content: '{"ops":[{"insert":"A cheap service"}]}',
    sig: 'sig2',
};


// A test wrapper to provide the necessary contexts
const DiscoveryViewTestWrapper: React.FC<{notes?: Note[]}> = ({notes = mockNotes}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  return (
    <NotesContext.Provider value={{ notes } as any}>
      <ViewContext.Provider value={{ selectedNoteId, setSelectedNoteId } as any}>
        <DiscoveryView />
      </ViewContext.Provider>
    </NotesContext.Provider>
  );
};

describe('DiscoveryView', () => {
  beforeEach(() => {
    findMatchingNotesSpy.mockResolvedValue([mockEvent]);
    useNostrProfileSpy.mockReturnValue({});
    vi.clearAllMocks();
  });

  it('renders the note list initially', () => {
    render(<DiscoveryViewTestWrapper />);
    expect(
      screen.getByText('Select one of your notes to find semantically related notes from the network.')
    ).toBeInTheDocument();
    expect(screen.getByText('Looking for a web developer')).toBeInTheDocument();
  });

  it('shows search criteria when a note is selected', async () => {
    render(<DiscoveryViewTestWrapper />);

    // Simulate selecting a note
    fireEvent.click(screen.getByText('Looking for a web developer'));

    expect(await screen.findByText('Search Criteria')).toBeInTheDocument();
    expect(screen.getByText('service')).toBeInTheDocument();
    expect(screen.getAllByText('is')).toHaveLength(2);
    expect(screen.getByText('Web Development')).toBeInTheDocument();
  });

  it('calls findMatchingNotes with the correct filter', async () => {
    render(<DiscoveryViewTestWrapper />);

    fireEvent.click(screen.getByText('Looking for a web developer'));

    const searchButton = await screen.findByRole('button', { name: /Find Matching Notes/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(findMatchingNotesSpy).toHaveBeenCalledWith({
        kinds: [nostrService.NOTENTION_KIND],
        '#p': ['service', 'price'],
      });
    });
  });

  it('displays results after searching', async () => {
    render(<DiscoveryViewTestWrapper />);

    fireEvent.click(screen.getByText('Looking for a web developer'));

    const searchButton = await screen.findByRole('button', { name: /Find Matching Notes/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Found 1 matching note(s)')).toBeInTheDocument();
      expect(screen.getByText('I am a web developer')).toBeInTheDocument();
    });
  });

  it('highlights the matching properties in the result card', async () => {
    render(<DiscoveryViewTestWrapper />);

    fireEvent.click(screen.getByText('Looking for a web developer'));

    const searchButton = await screen.findByRole('button', { name: /Find Matching Notes/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Matching Properties')).toBeInTheDocument();
      expect(
        screen.getByText('service:is:Web Development')
      ).toBeInTheDocument();
    });
  });

  it('finds notes with "less than" operator', async () => {
    findMatchingNotesSpy.mockResolvedValue([mockEvent, mockEvent2]);
    render(<DiscoveryViewTestWrapper notes={[mockNotes[2]]} />);

    fireEvent.click(screen.getByText('Looking for cheap services'));

    const searchButton = await screen.findByRole('button', { name: /Find Matching Notes/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      const results = screen.getAllByTestId('nostr-event-card');
      expect(results).toHaveLength(2);
      expect(screen.getByText('Found 2 matching note(s)')).toBeInTheDocument();
      expect(screen.getByText('A cheap service')).toBeInTheDocument();
      expect(screen.getByText('I am a web developer')).toBeInTheDocument();
    });
  });
});

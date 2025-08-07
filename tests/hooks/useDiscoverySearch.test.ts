import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDiscoverySearch } from '../../hooks/useDiscoverySearch';
import * as nostrService from '../../services/nostrService';
import type { Note } from '../../types';

// Mock the nostrService to avoid actual network calls
vi.mock('../../services/nostrService', () => ({
  findMatchingNotes: vi.fn().mockResolvedValue([]), // Return an empty array to avoid filter error
  NOTENTION_KIND: 30019,
}));

const mockNote: Note = {
  id: 'note1',
  title: 'Test Note',
  content: 'This is a test note',
  tags: [],
  properties: [
    { key: 'service', op: 'is', values: ['web-design'] },
    { key: 'budget', op: 'less than', values: ['5000'] },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('useDiscoverySearch', () => {
  it('should construct the correct filter and call findMatchingNotes', async () => {
    const { result } = renderHook(() => useDiscoverySearch(mockNote, []));

    await act(async () => {
      await result.current.handleSearch();
    });

    const expectedFilter = {
      kinds: [30019],
      '#p': [
        ['service', 'is', 'web-design'],
        ['price'], // 'budget' is mapped to 'price'
      ],
      limit: 200,
    };

    expect(nostrService.findMatchingNotes).toHaveBeenCalledWith(expectedFilter);
  });
});

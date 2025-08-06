import { act, renderHook } from '@testing-library/react';
import { useNotes } from '../../hooks/useNotes';
import { useLocalForage } from '../../hooks/useLocalForage';
import type { Note } from '../../types';

// Mock the useLocalForage hook
vi.mock('../../hooks/useLocalForage');

const mockUseLocalForage = useLocalForage as jest.Mock;

describe('services/notes', () => {
  let mockSetNotes: jest.Mock;

  beforeEach(() => {
    mockSetNotes = vi.fn();
    mockUseLocalForage.mockReturnValue([[], mockSetNotes, false]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add a new note', () => {
    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.addNote();
    });

    expect(mockSetNotes).toHaveBeenCalledTimes(1);
    expect(mockSetNotes).toHaveBeenCalledWith(expect.any(Function));

    // Check the new note structure
    const updater = mockSetNotes.mock.calls[0][0];
    const existingNotes: Note[] = [];
    const newNotes = updater(existingNotes);
    expect(newNotes.length).toBe(1);
    expect(newNotes[0]).toEqual(
      expect.objectContaining({
        title: 'Untitled Note',
        content: '',
      })
    );
  });

  it('should update an existing note', () => {
    const initialNotes: Note[] = [
      {
        id: '1',
        title: 'Note 1',
        content: 'Content 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        properties: [],
      },
    ];
    mockUseLocalForage.mockReturnValue([initialNotes, mockSetNotes, false]);

    const { result } = renderHook(() => useNotes());
    const updatedNote = { ...initialNotes[0], title: 'Updated Title' };

    act(() => {
      result.current.updateNote(updatedNote);
    });

    expect(mockSetNotes).toHaveBeenCalledTimes(1);
    const updater = mockSetNotes.mock.calls[0][0];
    const newNotes = updater(initialNotes);
    expect(newNotes[0].title).toBe('Updated Title');
  });

  it('should delete a note', () => {
    const initialNotes: Note[] = [
      {
        id: '1',
        title: 'Note 1',
        content: 'Content 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        properties: [],
      },
      {
        id: '2',
        title: 'Note 2',
        content: 'Content 2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        properties: [],
      },
    ];
    mockUseLocalForage.mockReturnValue([initialNotes, mockSetNotes, false]);

    const { result } = renderHook(() => useNotes());

    act(() => {
      result.current.deleteNote('1');
    });

    expect(mockSetNotes).toHaveBeenCalledTimes(1);
    const updater = mockSetNotes.mock.calls[0][0];
    const newNotes = updater(initialNotes);
    expect(newNotes.length).toBe(1);
    expect(newNotes[0].id).toBe('2');
  });
});

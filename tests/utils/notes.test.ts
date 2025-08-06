import { describe, it, expect } from 'vitest';
import { sortNotesByDate } from '../../utils/notes';
import { Note } from '../../types';

describe('sortNotesByDate', () => {
  const now = new Date();
  const notes: Note[] = [
    {
      id: '1',
      title: 'Note 1',
      content: 'old',
      tags: [],
      properties: [],
      createdAt: new Date(now.getTime() - 2000).toISOString(),
      updatedAt: new Date(now.getTime() - 2000).toISOString(),
    },
    {
      id: '2',
      title: 'Note 2',
      content: 'newest',
      tags: [],
      properties: [],
      createdAt: new Date(now.getTime() - 1000).toISOString(),
      updatedAt: new Date(now.getTime()).toISOString(),
    },
    {
      id: '3',
      title: 'Note 3',
      content: 'older',
      tags: [],
      properties: [],
      createdAt: new Date(now.getTime() - 3000).toISOString(),
      updatedAt: new Date(now.getTime() - 1000).toISOString(),
    },
  ];

  it('should sort notes by updatedAt in descending order', () => {
    const sorted = sortNotesByDate(notes);
    expect(sorted.map(n => n.id)).toEqual(['2', '3', '1']);
  });

  it('should return an empty array if given an empty array', () => {
    const sorted = sortNotesByDate([]);
    expect(sorted).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const originalNotes = [...notes];
    sortNotesByDate(originalNotes);
    expect(originalNotes).toEqual(notes);
  });
});

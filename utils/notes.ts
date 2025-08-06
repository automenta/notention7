import { Note } from '../types';

export const sortNotesByDate = (notes: Note[]): Note[] => {
  return notes
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
};

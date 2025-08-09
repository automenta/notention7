import type {Note} from '@/types';
import {getTextFromHtml} from './dom';

export const filterNotes = (notes: Note[], searchTerm: string): Note[] => {
    if (!searchTerm.trim()) {
        return notes;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const searchParts: string[] =
        lowerCaseSearchTerm.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const textQueries = searchParts
        .filter((p) => !p.startsWith('#') && !p.includes(':'))
        .map((p) => p.replace(/"/g, ''));
    const tagQueries = searchParts
        .filter((p) => p.startsWith('#'))
        .map((p) => p.substring(1));
    const propQueries = searchParts
        .filter((p) => p.includes(':'))
        .map((p) => {
            const [key, value] = p.split(':', 2);
            return {key, value: value.replace(/"/g, '')};
        });

    return notes.filter((note) => {
        const noteContentText = getTextFromHtml(note.content).toLowerCase();
        const noteTitle = note.title.toLowerCase();

        const textMatch = textQueries.every(
            (query) => noteTitle.includes(query) || noteContentText.includes(query)
        );

        const tagMatch = tagQueries.every((query) =>
            (note.tags || []).some((tag) => tag.toLowerCase().includes(query))
        );

        const propMatch = propQueries.every((query) =>
            (note.properties || []).some(
                (prop) =>
                    prop.key.toLowerCase() === query.key &&
                    prop.values.some((val) => val.toLowerCase().includes(query.value))
            )
        );

        return textMatch && tagMatch && propMatch;
    });
};

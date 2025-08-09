import {useMemo} from 'react';
import type {Note} from '@/types';
import {getTextFromHtml} from '../utils/nostr';

type SortOrder =
    | 'updatedAt_desc'
    | 'updatedAt_asc'
    | 'createdAt_desc'
    | 'createdAt_asc'
    | 'title_asc'
    | 'title_desc';

export const useSortedFilteredNotes = (
    notes: Note[],
    searchTerm: string,
    sortOrder: SortOrder
) => {
    const filteredNotes = useMemo(() => {
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
    }, [notes, searchTerm]);

    return useMemo(() => {
        return [...filteredNotes].sort((a, b) => {
            switch (sortOrder) {
                case 'updatedAt_desc':
                    return (
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    );
                case 'updatedAt_asc':
                    return (
                        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
                    );
                case 'createdAt_desc':
                    return (
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                case 'createdAt_asc':
                    return (
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });
    }, [filteredNotes, sortOrder]);


};

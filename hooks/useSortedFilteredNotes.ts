import {useMemo} from 'react';
import type {Note} from '@/types';
import {filterNotes} from '../utils/search';

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
    const filteredNotes = useMemo(
        () => filterNotes(notes, searchTerm),
        [notes, searchTerm]
    );

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

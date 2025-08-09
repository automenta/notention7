import {describe, it, expect} from 'vitest';
import {filterNotes} from '../../utils/search';
import type {Note} from '../../types';

const mockNotes: Note[] = [
    {
        id: '1',
        title: 'First Note',
        content: '<p>This is a test note about React.</p>',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
        tags: ['#react', '#testing'],
        properties: [{key: 'status', operator: 'is', values: ['draft']}],
    },
    {
        id: '2',
        title: 'Second Note',
        content: '<p>Another note, this one is about TypeScript.</p>',
        createdAt: '2024-01-02T12:00:00.000Z',
        updatedAt: '2024-01-02T12:00:00.000Z',
        tags: ['#typescript'],
        properties: [{key: 'status', operator: 'is', values: ['published']}],
    },
    {
        id: '3',
        title: 'Third Note about React',
        content: '<p>A final note on testing strategies.</p>',
        createdAt: '2024-01-03T12:00:00.000Z',
        updatedAt: '2024-01-03T12:00:00.000Z',
        tags: ['#react', '#testing'],
        properties: [{key: 'status', operator: 'is', values: ['published']}],
    },
];

describe('utils/search', () => {
    it('should return all notes if search term is empty', () => {
        expect(filterNotes(mockNotes, '')).toHaveLength(3);
        expect(filterNotes(mockNotes, '  ')).toHaveLength(3);
    });

    it('should filter by a single text query in title', () => {
        const result = filterNotes(mockNotes, 'Second');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('should filter by a single text query in content', () => {
        const result = filterNotes(mockNotes, 'TypeScript');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('should filter by multiple text queries', () => {
        const result = filterNotes(mockNotes, 'note React');
        expect(result).toHaveLength(2);
        expect(result.map((n) => n.id)).toEqual(['1', '3']);
    });

    it('should filter by a single tag query', () => {
        const result = filterNotes(mockNotes, '#typescript');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('should filter by multiple tag queries', () => {
        const result = filterNotes(mockNotes, '#react #testing');
        expect(result).toHaveLength(2);
        expect(result.map((n) => n.id)).toEqual(['1', '3']);
    });

    it('should filter by a single property query', () => {
        const result = filterNotes(mockNotes, 'status:draft');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should filter by a property query with quoted value', () => {
        const result = filterNotes(mockNotes, 'status:"published"');
        expect(result).toHaveLength(2);
        expect(result.map((n) => n.id)).toEqual(['2', '3']);
    });

    it('should combine text, tag, and property queries', () => {
        const result = filterNotes(
            mockNotes,
            'note #testing status:published'
        );
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('3');
    });

    it('should be case-insensitive', () => {
        const result = filterNotes(
            mockNotes,
            'NOTE #tEsTiNg sTaTuS:pUbLiShEd'
        );
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('3');
    });
});

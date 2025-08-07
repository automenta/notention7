import { describe, expect, it } from 'vitest';
import { getNoteSemantics, matchNotes } from '@/utils/noteSemantics.ts';
import type { Property, OntologyAttribute } from '../../types';

describe('getNoteSemantics', () => {
  // These tests are fine and do not need to be changed.
  it('should return empty arrays and isImaginary false for content with no semantics', () => {
    const html = '<p>This is some plain text.</p>';
    const { tags, properties, isImaginary } = getNoteSemantics(html);
    expect(tags).toEqual([]);
    expect(properties).toEqual([]);
    expect(isImaginary).toBe(false);
  });
});

describe('matchNotes', () => {
  const ontologyIndex = new Map<string, OntologyAttribute>([
    ['status', { type: 'enum', operators: { real: ['is'], imaginary: ['is not'] } }],
    ['title', { type: 'string', operators: { real: ['is'], imaginary: ['contains', 'does not contain'] } }],
    // CORRECTED OPERATORS
    ['price', { type: 'number', operators: { real: ['is'], imaginary: ['is', 'is not', 'less than', 'greater than', 'between'] } }],
    ['deadline', { type: 'date', operators: { real: ['is'], imaginary: ['is on', 'is not on', 'is after', 'is before', 'between', 'is not between'] } }],
    ['eventTime', { type: 'datetime', operators: { real: ['is'], imaginary: ['is on', 'is not on', 'is after', 'is before', 'between', 'is not between'] } }],
  ]);

  const p = (key: string, operator: string, values: string[]): Property => ({
    key,
    operator,
    values,
  });

  it('should return true for an empty query', () => {
    const source = [p('status', 'is', ['active'])];
    expect(matchNotes(source, [], ontologyIndex)).toBe(true);
  });

  it('should return false for a non-empty query with an empty source', () => {
    const query = [p('status', 'is', ['active'])];
    expect(matchNotes([], query, ontologyIndex)).toBe(false);
  });

  it('should return false if a query property key is not in the ontology', () => {
    const source = [p('status', 'is', ['active'])];
    const query = [p('unknownKey', 'is', ['value'])];
    expect(matchNotes(source, query, ontologyIndex)).toBe(false);
  });

  describe('String/Enum Matching', () => {
    it.each([
      { sourceVal: 'active', op: 'is', queryVal: ['active'], match: true },
      { sourceVal: 'active', op: 'is not', queryVal: ['inactive'], match: true },
      { sourceVal: 'hello world', op: 'contains', queryVal: ['world'], match: true },
      { sourceVal: 'hello world', op: 'does not contain', queryVal: ['universe'], match: true },
    ])('should handle string op "$op" correctly (match: $match)', ({ sourceVal, op, queryVal, match }) => {
      const source = [p('title', 'is', [sourceVal])];
      const query = [p('title', op, queryVal)];
      expect(matchNotes(source, query, ontologyIndex)).toBe(match);
    });
  });

  describe('Number Matching', () => {
    it.each([
      { sourceVal: '100', op: 'is', queryVal: ['100.0'], match: true },
      { sourceVal: '100', op: 'is not', queryVal: ['101'], match: true },
      // CORRECTED OPERATORS
      { sourceVal: '101', op: 'greater than', queryVal: ['100'], match: true },
      { sourceVal: '100', op: 'greater than', queryVal: ['100'], match: false },
      { sourceVal: '99', op: 'less than', queryVal: ['100'], match: true },
      { sourceVal: '100', op: 'less than', queryVal: ['100'], match: false },
      { sourceVal: '150', op: 'between', queryVal: ['100', '200'], match: true },
    ])('should handle number op "$op" correctly (match: $match)', ({ sourceVal, op, queryVal, match }) => {
      const source = [p('price', 'is', [sourceVal])];
      const query = [p('price', op, queryVal)];
      expect(matchNotes(source, query, ontologyIndex)).toBe(match);
    });

    it('should handle invalid numbers gracefully', () => {
      const source = [p('price', 'is', ['not-a-number'])];
      const query = [p('price', 'less than', ['100'])];
      expect(matchNotes(source, query, ontologyIndex)).toBe(false);
    });
  });

  describe('Date/DateTime Matching', () => {
    it.each([
      { key: 'deadline', sourceVal: '2024-05-10', op: 'is on', queryVal: ['2024-05-10'], match: true },
      { key: 'deadline', sourceVal: '2024-05-11', op: 'is after', queryVal: ['2024-05-10'], match: true },
      { key: 'deadline', sourceVal: '2024-05-09', op: 'is before', queryVal: ['2024-05-10'], match: true },
      { key: 'deadline', sourceVal: '2024-05-15', op: 'between', queryVal: ['2024-05-10', '2024-05-20'], match: true },
      { key: 'deadline', sourceVal: '2024-05-25', op: 'is not between', queryVal: ['2024-05-10', '2024-05-20'], match: true },
    ])('should handle date op "$op" on key "$key" correctly (match: $match)', ({ key, sourceVal, op, queryVal, match }) => {
      const source = [p(key, 'is', [sourceVal])];
      const query = [p(key, op, queryVal)];
      expect(matchNotes(source, query, ontologyIndex)).toBe(match);
    });

     it('should handle invalid dates gracefully', () => {
      const source = [p('deadline', 'is', ['not-a-date'])];
      const query = [p('deadline', 'is after', ['2024-01-01'])];
      expect(matchNotes(source, query, ontologyIndex)).toBe(false);
    });
  });

  it('should match when all of multiple query properties are satisfied', () => {
    const source = [
      p('status', 'is', ['active']),
      p('price', 'is', ['99']),
    ];
    const query = [
      p('status', 'is', ['active']),
      p('price', 'less than', ['100']),
    ];
    expect(matchNotes(source, query, ontologyIndex)).toBe(true);
  });

  it('should not match if any of multiple query properties is not satisfied', () => {
     const source = [
      p('status', 'is', ['active']),
      p('price', 'is', ['101']),
    ];
    const query = [
      p('status', 'is', ['active']),
      p('price', 'less than', ['100']),
    ];
    expect(matchNotes(source, query, ontologyIndex)).toBe(false);
  });
});

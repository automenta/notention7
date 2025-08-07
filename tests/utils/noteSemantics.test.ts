import { describe, expect, it } from 'vitest';
import { getNoteSemantics, matchNotes } from '@/utils/noteSemantics.ts';
import type { Property } from '../../types';

describe('getNoteSemantics', () => {
  it('should return empty arrays and isImaginary false for content with no semantics', () => {
    const html = '<p>This is some plain text.</p>';
    const { tags, properties, isImaginary } = getNoteSemantics(html);
    expect(tags).toEqual([]);
    expect(properties).toEqual([]);
    expect(isImaginary).toBe(false);
  });

  it('should extract a single tag', () => {
    const html =
      '<p>This has a <span class="widget tag" data-tag="project">#project</span>.</p>';
    const { tags } = getNoteSemantics(html);
    expect(tags).toEqual(['project']);
  });

  it('should extract multiple unique tags', () => {
    const html =
      '<p>This has <span class="widget tag" data-tag="project">#project</span> and <span class="widget tag" data-tag="idea">#idea</span>.</p>';
    const { tags } = getNoteSemantics(html);
    expect(tags).toEqual(['project', 'idea']);
  });

  it('should return only unique tags even if duplicates exist in HTML', () => {
    const html =
      '<p><span class="widget tag" data-tag="project">#project</span> and <span class="widget tag" data-tag="project">#project</span>.</p>';
    const { tags } = getNoteSemantics(html);
    expect(tags).toEqual(['project']);
  });

  it('should extract a simple property with "is" operator', () => {
    const html =
      '<p>Test <span class="widget property" data-key="status" data-operator="is" data-values=\'["active"]\'>[status:is:active]</span></p>';
    const { properties, isImaginary } = getNoteSemantics(html);
    expect(properties).toEqual([
      { key: 'status', operator: 'is', values: ['active'] },
    ]);
    expect(isImaginary).toBe(false);
  });

  it('should extract a property with a non-"is" operator and set isImaginary to true', () => {
    const html =
      '<p>Test <span class="widget property" data-key="price" data-operator="<" data-values=\'["100"]\'>[price < 100]</span></p>';
    const { properties, isImaginary } = getNoteSemantics(html);
    expect(properties).toEqual([
      { key: 'price', operator: '<', values: ['100'] },
    ]);
    expect(isImaginary).toBe(true);
  });

  it('should set isImaginary to true if even one of multiple properties is imaginary', () => {
    const html = `
      <p>
        <span class="widget property" data-key="status" data-operator="is" data-values='["active"]'>[status:is:active]</span>
        <span class="widget property" data-key="price" data-operator=">" data-values='["50"]'>[price > 50]</span>
      </p>`;
    const { isImaginary } = getNoteSemantics(html);
    expect(isImaginary).toBe(true);
  });

  it('should correctly parse a property with multiple values', () => {
    const html =
      '<p><span class="widget property" data-key="assignee" data-operator="is" data-values=\'["Alice","Bob"]\'>[assignee:is:Alice,Bob]</span></p>';
    const { properties } = getNoteSemantics(html);
    expect(properties[0].values).toEqual(['Alice', 'Bob']);
  });

  it('should handle malformed data-values gracefully', () => {
    const html =
      '<p><span class="widget property" data-key="status" data-operator="is" data-values="not-a-json-array">[status:is:broken]</span></p>';
    const { properties } = getNoteSemantics(html);
    expect(properties[0].values).toEqual([]);
  });

  it('should handle missing data-values attribute gracefully', () => {
    const html =
      '<p><span class="widget property" data-key="status" data-operator="is">[status:is:missing]</span></p>';
    const { properties } = getNoteSemantics(html);
    expect(properties[0].values).toEqual([]);
  });

  it('should extract both tags and properties from the same content', () => {
    const html = `
      <p>
        <span class="widget tag" data-tag="urgent">#urgent</span>
        <span class="widget property" data-key="status" data-operator="is" data-values='["pending"]'>[status:is:pending]</span>
      </p>`;
    const { tags, properties } = getNoteSemantics(html);
    expect(tags).toEqual(['urgent']);
    expect(properties).toEqual([
      { key: 'status', operator: 'is', values: ['pending'] },
    ]);
  });

  it('should filter out properties that have no key', () => {
    const html =
      '<p><span class="widget property" data-key="" data-operator="is" data-values=\'["value"]\'></span></p>';
    const { properties } = getNoteSemantics(html);
    expect(properties).toEqual([]);
  });
});

describe('matchNotes', () => {
  const p = (key: string, operator: string, value: string): Property => ({
    key,
    operator,
    values: [value],
  });

  it('should match a simple "is" query', () => {
    const source = [p('status', 'is', 'active')];
    const query = [p('status', 'is', 'active')];
    expect(matchNotes(source, query)).toBe(true);
  });

  it('should not match a simple "is" query with different values', () => {
    const source = [p('status', 'is', 'inactive')];
    const query = [p('status', 'is', 'active')];
    expect(matchNotes(source, query)).toBe(false);
  });

  it('should match a "contains" query', () => {
    const source = [p('title', 'is', 'Hello World')];
    const query = [p('title', 'contains', 'World')];
    expect(matchNotes(source, query)).toBe(true);
  });

  it('should not match a "contains" query', () => {
    const source = [p('title', 'is', 'Hello World')];
    const query = [p('title', 'contains', 'Universe')];
    expect(matchNotes(source, query)).toBe(false);
  });

  it('should match a numeric "is less than" query', () => {
    const source = [p('price', 'is', '99')];
    const query = [p('price', 'is less than', '100')];
    expect(matchNotes(source, query)).toBe(true);
  });

  it('should not match a numeric "is less than" query', () => {
    const source = [p('price', 'is', '100')];
    const query = [p('price', 'is less than', '100')];
    expect(matchNotes(source, query)).toBe(false);
  });

  it('should match when all of multiple query properties are satisfied', () => {
    const source = [
      p('status', 'is', 'active'),
      p('priority', 'is', 'high'),
    ];
    const query = [
      p('status', 'is', 'active'),
      p('priority', 'is', 'high'),
    ];
    expect(matchNotes(source, query)).toBe(true);
  });

  it('should not match if any of multiple query properties is not satisfied', () => {
    const source = [
      p('status', 'is', 'active'),
      p('priority', 'is', 'low'),
    ];
    const query = [
      p('status', 'is', 'active'),
      p('priority', 'is', 'high'),
    ];
    expect(matchNotes(source, query)).toBe(false);
  });

  it('should match if the query is empty', () => {
    const source = [p('status', 'is', 'active')];
    const query: Property[] = [];
    expect(matchNotes(source, query)).toBe(true);
  });

  it('should not match if the source is empty but the query is not', () => {
    const source: Property[] = [];
    const query = [p('status', 'is', 'active')];
    expect(matchNotes(source, query)).toBe(false);
  });

  it('should handle "is not" operator correctly', () => {
    const source = [p('status', 'is', 'active')];
    const queryMatch = [p('status', 'is not', 'inactive')];
    const queryMismatch = [p('status', 'is not', 'active')];
    expect(matchNotes(source, queryMatch)).toBe(true);
    expect(matchNotes(source, queryMismatch)).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { parseHTML, serializeToHTML } from '../../utils/contentModel';
import type { ContentNode } from '../../types';

describe('contentModel', () => {
  describe('parseHTML', () => {
    it('should parse simple text', () => {
      const html = 'Hello world';
      const expected: ContentNode[] = [{ type: 'text', content: 'Hello world' }];
      expect(parseHTML(html)).toEqual(expected);
    });

    it('should parse a tag widget', () => {
      const html = '<span class="widget tag" contenteditable="false" data-tag="project">#project</span>';
      const expected: ContentNode[] = [
        { type: 'widget', kind: 'tag', tag: 'project' },
      ];
      expect(parseHTML(html)).toEqual(expected);
    });

    it('should parse a property widget', () => {
      const html = `<span id="123" class="widget property" contenteditable="false" data-key="status" data-operator="is" data-values='["done"]'>[status:is:done]</span>`;
      const expected: ContentNode[] = [
        {
          type: 'widget',
          kind: 'property',
          id: '123',
          key: 'status',
          operator: 'is',
          values: ['done'],
        },
      ];
      expect(parseHTML(html)).toEqual(expected);
    });

    it('should parse a mix of text and widgets', () => {
      const html = `Here is a tag: <span class="widget tag" contenteditable="false" data-tag="idea">#idea</span> and a property <span id="456" class="widget property" contenteditable="false" data-key="priority" data-operator="is" data-values='["high"]'>[priority:is:high]</span>.`;
      const expected: ContentNode[] = [
        { type: 'text', content: 'Here is a tag: ' },
        { type: 'widget', kind: 'tag', tag: 'idea' },
        { type: 'text', content: ' and a property ' },
        {
          type: 'widget',
          kind: 'property',
          id: '456',
          key: 'priority',
          operator: 'is',
          values: ['high'],
        },
        { type: 'text', content: '.' },
      ];
      expect(parseHTML(html)).toEqual(expected);
    });
  });

  describe('serializeToHTML', () => {
    it('should serialize simple text', () => {
      const model: ContentNode[] = [{ type: 'text', content: 'Hello world' }];
      const expected = 'Hello world';
      expect(serializeToHTML(model)).toBe(expected);
    });

    it('should serialize a tag widget', () => {
      const model: ContentNode[] = [
        { type: 'widget', kind: 'tag', tag: 'project' },
      ];
      const expected = `<span class="widget tag" contenteditable="false" data-tag="project">#project</span>`;
      expect(serializeToHTML(model)).toBe(expected);
    });

    it('should serialize a property widget', () => {
      const model: ContentNode[] = [
        {
          type: 'widget',
          kind: 'property',
          id: '123',
          key: 'status',
          operator: 'is',
          values: ['done'],
        },
      ];
      const expected = `<span id="123" class="widget property" contenteditable="false" data-key="status" data-operator="is" data-values='["done"]'>[status:is:done]</span>`;
      expect(serializeToHTML(model)).toBe(expected);
    });
  });

  describe('round-trip', () => {
    it('should return the same content after parsing and serializing', () => {
      const html = `Start text <span class="widget tag" contenteditable="false" data-tag="roundtrip">#roundtrip</span> middle text <span id="789" class="widget property" contenteditable="false" data-key="test" data-operator="is" data-values='["ok"]'>[test:is:ok]</span> end text.`;
      const model = parseHTML(html);
      const finalHtml = serializeToHTML(model);
      expect(finalHtml).toBe(html);
    });
  });
});

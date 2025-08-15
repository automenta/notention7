import { describe, expect, it } from 'vitest';
import { parseHTML, serializeToHTML } from '@/utils/contentModel';
import type { ContentModel } from '@/types';

describe('contentModel v2 (Hierarchical)', () => {
    describe('parseHTML', () => {
        it('should parse paragraphs', () => {
            const html = '<p>Hello world</p><p>Second paragraph</p>';
            const expected: ContentModel = [
                { type: 'paragraph', content: [{ type: 'text', content: 'Hello world' }] },
                { type: 'paragraph', content: [{ type: 'text', content: 'Second paragraph' }] },
            ];
            expect(parseHTML(html)).toEqual(expected);
        });

        it('should wrap content without paragraphs in a single paragraph', () => {
            const html = 'Some floating text.';
            const expected: ContentModel = [
                { type: 'paragraph', content: [{ type: 'text', content: 'Some floating text.' }] },
            ];
            expect(parseHTML(html)).toEqual(expected);
        });

        it('should parse a tag widget inside a paragraph', () => {
            const html = '<p>Here is a <span class="widget tag" data-tag="project">#project</span></p>';
            const expected: ContentModel = [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', content: 'Here is a ' },
                        { type: 'widget', kind: 'tag', tag: 'project' },
                    ],
                },
            ];
            expect(parseHTML(html)).toEqual(expected);
        });

        it('should parse a property widget inside a div', () => {
            const html = `<div>A property: <span id="123" class="widget property" data-key="status" data-operator="is" data-values='["done"]'>[status:is:done]</span></div>`;
            const expected: ContentModel = [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', content: 'A property: ' },
                        {
                            type: 'widget',
                            kind: 'property',
                            id: '123',
                            key: 'status',
                            operator: 'is',
                            values: ['done'],
                        },
                    ],
                },
            ];
            expect(parseHTML(html)).toEqual(expected);
        });

        it('should handle empty input', () => {
            const html = '';
            const expected: ContentModel = [
                { type: 'paragraph', content: [{ type: 'text', content: '' }] },
            ];
            expect(parseHTML(html)).toEqual(expected);
        });

        it('should handle paragraphs with only a widget', () => {
            const html = '<p><span class="widget tag" data-tag="only">#only</span></p>';
            const expected: ContentModel = [
                {
                    type: 'paragraph',
                    content: [{ type: 'widget', kind: 'tag', tag: 'only' }],
                },
            ];
            expect(parseHTML(html)).toEqual(expected);
        });
    });

    describe('serializeToHTML', () => {
        it('should serialize multiple paragraphs', () => {
            const model: ContentModel = [
                { type: 'paragraph', content: [{ type: 'text', content: 'Hello world' }] },
                { type: 'paragraph', content: [{ type: 'text', content: 'Second paragraph' }] },
            ];
            const expected = '<p>Hello world</p><p>Second paragraph</p>';
            expect(serializeToHTML(model)).toBe(expected);
        });

        it('should serialize a paragraph with mixed content', () => {
            const model: ContentModel = [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', content: 'A tag: ' },
                        { type: 'widget', kind: 'tag', tag: 'test' },
                        { type: 'text', content: '.' },
                    ],
                },
            ];
            const expected = '<p>A tag: <span class="widget tag" contenteditable="false" data-tag="test">#test</span>.</p>';
            expect(serializeToHTML(model)).toBe(expected);
        });

        it('should serialize an empty paragraph with a placeholder', () => {
            const model: ContentModel = [{ type: 'paragraph', content: [] }];
            const expected = '<p>&#8203;</p>'; // Zero-width space
            expect(serializeToHTML(model)).toBe(expected);
        });
    });

    describe('round-trip consistency', () => {
        it('should produce a consistent model after a serialize -> parse loop', () => {
            const model: ContentModel = [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', content: 'Here is a ' },
                        { type: 'widget', kind: 'tag', tag: 'roundtrip' },
                        { type: 'text', content: ' and a ' },
                        {
                            type: 'widget',
                            kind: 'property',
                            id: 'xyz',
                            key: 'value',
                            operator: '>',
                            values: [100],
                        },
                    ],
                },
                { type: 'paragraph', content: [{ type: 'text', content: 'Another line.' }] },
            ];

            const generatedHtml = serializeToHTML(model);
            const parsedModel = parseHTML(generatedHtml);

            // We need to normalize the parsed model because the parser might create
            // slightly different text nodes. For this test, we are more concerned
            // with the structure and widget data.
            // A simple JSON stringify is enough for a deep structural comparison.
            expect(JSON.stringify(parsedModel)).toEqual(JSON.stringify(model));
        });

        it('should correctly handle special characters in text', () => {
            const model: ContentModel = [
                {type: 'paragraph', content: [{type: 'text', content: 'Text with < & > characters'}]}
            ];
            const html = serializeToHTML(model);
            expect(html).toBe('<p>Text with &lt; &amp; &gt; characters</p>');
            const parsed = parseHTML(html);
            expect(parsed).toEqual(model);
        });
    });
});

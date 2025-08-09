import {describe, expect, it} from 'vitest';
import {getTextFromHtml} from '@/utils/dom';

describe('getTextFromHtml', () => {
    it('should extract text from a simple p tag', () => {
        const html = '<p>Hello World</p>';
        expect(getTextFromHtml(html).trim()).toBe('Hello World');
    });

    it('should handle multiple block elements', () => {
        const html = '<h1>Title</h1><p>First paragraph.</p><p>Second paragraph.</p>';
        const result = getTextFromHtml(html).trim();
        // In JSDOM, innerText might not produce newlines exactly like a browser.
        // We will check for the presence of text content.
        expect(result).toContain('Title');
        expect(result).toContain('First paragraph.');
        expect(result).toContain('Second paragraph.');
    });

    it('should return an empty string for empty input', () => {
        expect(getTextFromHtml('')).toBe('');
    });

    it('should return an empty string for HTML with no text content', () => {
        expect(getTextFromHtml('<p><img></p>').trim()).toBe('');
    });

    it('should handle nested html', () => {
        const html = '<div><p>Some <strong>bold</strong> text.</p></div>';
        expect(getTextFromHtml(html).trim()).toBe('Some bold text.');
    });
});

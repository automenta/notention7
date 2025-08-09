import {describe, expect, it} from 'vitest';
import {sanitizeHTML} from '@/utils/sanitize.ts';

describe('sanitizeHTML', () => {
    it('should remove script tags from the input string', () => {
        const dirtyHTML = '<p>Hello <script>alert("xss");</script> World</p>';
        const sanitizedHTML = sanitizeHTML(dirtyHTML);
        expect(sanitizedHTML).toBe('<p>Hello  World</p>');
    });

    it('should keep safe tags like <p> and <b>', () => {
        const safeHTML = '<p>This is <b>bold</b> text.</p>';
        const sanitizedHTML = sanitizeHTML(safeHTML);
        expect(sanitizedHTML).toBe(safeHTML);
    });

    it('should remove dangerous attributes like onclick', () => {
        const dangerousHTML = '<p onclick="alert(\'xss\')">Click me</p>';
        const sanitizedHTML = sanitizeHTML(dangerousHTML);
        expect(sanitizedHTML).toBe('<p>Click me</p>');
    });

    it('should handle an empty string', () => {
        const emptyHTML = '';
        const sanitizedHTML = sanitizeHTML(emptyHTML);
        expect(sanitizedHTML).toBe('');
    });
});

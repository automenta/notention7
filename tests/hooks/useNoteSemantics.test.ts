import {renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {useNoteSemantics} from '@/hooks/useNoteSemantics.ts';

describe('useNoteSemantics', () => {
    it('should initialize with empty semantics for empty content', () => {
        const {result} = renderHook(() => useNoteSemantics(''));
        expect(result.current.tags).toEqual([]);
        expect(result.current.properties).toEqual([]);
        expect(result.current.isImaginary).toBe(false);
    });

    it('should extract tags and properties on initial render', () => {
        const initialHtml = `
      <p>
        <span class="widget tag" data-tag="initial">#initial</span>
        <span class="widget property" data-key="status" data-operator="is" data-values='["ready"]'>[status:is:ready]</span>
      </p>
    `;
        const {result} = renderHook(() => useNoteSemantics(initialHtml));

        expect(result.current.tags).toEqual(['initial']);
        expect(result.current.properties).toEqual([
            {key: 'status', operator: 'is', values: ['ready']},
        ]);
        expect(result.current.isImaginary).toBe(false);
    });

    it('should update semantics when htmlContent changes', () => {
        const initialHtml = '<p>Initial content</p>';
        const updatedHtml = `
      <p>
        <span class="widget tag" data-tag="updated">#updated</span>
        <span class="widget property" data-key="price" data-operator=">" data-values='["100"]'>[price > 100]</span>
      </p>
    `;

        const {result, rerender} = renderHook(
            ({htmlContent}) => useNoteSemantics(htmlContent),
            {initialProps: {htmlContent: initialHtml}}
        );

        // Initial state check
        expect(result.current.tags).toEqual([]);
        expect(result.current.properties).toEqual([]);
        expect(result.current.isImaginary).toBe(false);

        // Rerender with new props
        rerender({htmlContent: updatedHtml});

        // Updated state check
        expect(result.current.tags).toEqual(['updated']);
        expect(result.current.properties).toEqual([
            {key: 'price', operator: '>', values: ['100']},
        ]);
        expect(result.current.isImaginary).toBe(true);
    });

    it('should correctly identify an imaginary note', () => {
        const imaginaryHtml =
            '<p><span class="widget property" data-key="budget" data-operator="<" data-values=\'["5000"]\'>[budget < 5000]</span></p>';
        const {result} = renderHook(() => useNoteSemantics(imaginaryHtml));
        expect(result.current.isImaginary).toBe(true);
    });

    it('should correctly identify a real note', () => {
        const realHtml =
            '<p><span class="widget property" data-key="project" data-operator="is" data-values=\'["Notention"]\'>[project:is:Notention]</span></p>';
        const {result} = renderHook(() => useNoteSemantics(realHtml));
        expect(result.current.isImaginary).toBe(false);
    });
});

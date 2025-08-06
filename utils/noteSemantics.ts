import type {Property} from '../types';

export const getNoteSemantics = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const foundTags = Array.from(
        tempDiv.querySelectorAll<HTMLElement>('.widget.tag')
    )
        .map((el) => el.dataset.tag || '')
        .filter(Boolean);
    const tags = Array.from(new Set(foundTags)); // Ensure uniqueness

    const foundProperties: Property[] = Array.from(
        tempDiv.querySelectorAll<HTMLElement>('.widget.property')
    )
        .map((el) => {
            let values: string[] = [];
            try {
                // Safely parse the values array from the data attribute
                values = JSON.parse(el.dataset.values || '[]');
                if (!Array.isArray(values)) values = [];
            } catch {
                values = []; // Default to empty array on parsing error
            }

            return {
                key: el.dataset.key || '',
                operator: el.dataset.operator || 'is',
                values: values,
            };
        })
        .filter((p) => p.key);
    const properties = foundProperties;

    // An imaginary property is one whose operator is not 'is'.
    const isImaginary = foundProperties.some((p) => p.operator !== 'is');

    return {tags, properties, isImaginary};
};

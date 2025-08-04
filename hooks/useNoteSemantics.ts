
import { useState, useEffect } from 'react';
import type { Property } from '../types';

export const useNoteSemantics = (htmlContent: string) => {
    const [tags, setTags] = useState<string[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isImaginary, setIsImaginary] = useState(false);

    useEffect(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const foundTags = Array.from(tempDiv.querySelectorAll<HTMLElement>('.widget.tag'))
            .map(el => el.dataset.tag || '')
            .filter(Boolean);
        setTags(Array.from(new Set(foundTags))); // Ensure uniqueness

        const foundProperties: Property[] = Array.from(tempDiv.querySelectorAll<HTMLElement>('.widget.property'))
            .map(el => {
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
            .filter(p => p.key);
        setProperties(foundProperties);

        // An imaginary property is one whose operator is not 'is'.
        setIsImaginary(foundProperties.some(p => p.operator !== 'is'));
        
    }, [htmlContent]);

    return { tags, properties, isImaginary };
};
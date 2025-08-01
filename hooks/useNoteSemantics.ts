import { useState, useEffect } from 'react';
import type { Property } from '../types';

const TAG_REGEX = /#([a-zA-Z0-9_]+)/g;
const PROPERTY_REGEX = /\[\s*([^:]+?)\s*:\s*([^\]]+?)\s*\]/g;

export const useNoteSemantics = (htmlContent: string) => {
    const [tags, setTags] = useState<string[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isImaginary, setIsImaginary] = useState(false);

    useEffect(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || '';
        
        const foundTags = new Set<string>();
        let tagMatch;
        while ((tagMatch = TAG_REGEX.exec(text)) !== null) {
            foundTags.add(tagMatch[1]);
        }
        setTags(Array.from(foundTags));

        const foundProperties: Property[] = [];
        let propMatch;
        while ((propMatch = PROPERTY_REGEX.exec(text)) !== null) {
            const key = propMatch[1].trim();
            const value = propMatch[2].trim();
            if (key && value) {
                foundProperties.push({
                    key,
                    operator: 'is', // Simplified operator for text-based properties
                    values: [value],
                });
            }
        }
        setProperties(foundProperties);

        // The concept of "imaginary" properties is removed with the new text-based syntax.
        setIsImaginary(false);
        
    }, [htmlContent]);

    return { tags, properties, isImaginary };
};
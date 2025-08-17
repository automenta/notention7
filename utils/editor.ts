import {formatPropertyForDisplay} from './properties';

/**
 * Strips HTML tags and decodes HTML entities from a string.
 * @param html The HTML string to clean.
 * @returns The plain text representation of the HTML.
 */
export const getCleanText = (html: string): string => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
};

// A one-time conversion for legacy note content from plain text to widgets.
import {ContentNode} from '../types';

export const convertPlainTextToWidgets = (html: string): string => {
    if (!html) return html;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // If widgets already exist, assume it's modern format
    if (tempDiv.querySelector('.widget[data-operator]')) return html;

    let widgetizedHtml = html;
    // Regex for legacy [key:value] format
    const propertyRegex = /\[\s*([^:<>]+?)\s*:\s*([^\]<>]*?)\s*\]/g;
    const tagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)/g;

    widgetizedHtml = widgetizedHtml.replace(
        propertyRegex,
        (match, key, value) => {
            const k = key.trim();
            const v = value ? value.trim() : '';
            const operator = 'is';
            const values = [v];
            return `<span class="widget property" contenteditable="false" data-key="${k}" data-operator="${operator}" data-values='${JSON.stringify(values)}'>${formatPropertyForDisplay(k, operator, values)}</span>`;
        }
    );

    widgetizedHtml = widgetizedHtml.replace(tagRegex, (match, tag) => {
        const prefix = match.startsWith(' ') ? ' ' : '';
        return `${prefix}<span class="widget tag" contenteditable="false" data-tag="${tag}">#${tag}</span>`;
    });

    return widgetizedHtml;
};

export const findModelPosition = (model: ContentNode[], charPosition: number) => {
    let currentCharCount = 0;
    for (let i = 0; i < model.length; i++) {
        const node = model[i];
        if (node.type === 'text') {
            const nodeLength = node.content.length;
            if (currentCharCount + nodeLength >= charPosition) {
                return {index: i, offset: charPosition - currentCharCount};
            }
            currentCharCount += nodeLength;
        } else if (node.type === 'widget') {
            // Widgets are treated as a single character
            if (currentCharCount + 1 >= charPosition) {
                return {index: i, offset: charPosition - currentCharCount};
            }
            currentCharCount += 1;
        }
    }
    return {index: model.length, offset: 0}; // Default to the end
};

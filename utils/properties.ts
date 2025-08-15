/**
 * A map from operator keys to their display symbols.
 * This ensures consistent visual representation of semantic operators across the app.
 */
export const OPERATOR_MAP: Record<string, string> = {
    is: ':',
    'is not': '≠',
    contains: '∋',
    'is near': '≈',
    'is after': '>',
    'is before': '<',
    'less than': '<',
    'greater than': '>',
    between: '↔',
};

/**
 * Formats a property's data into a rich HTML string for display inside a widget.
 * This function handles different operators and value structures to create a
 * readable and consistently styled representation.
 * @param key - The property key.
 * @param operator - The property operator (e.g., 'is', 'less than').
 * @param values - An array of property values.
 * @returns An HTML string to be used as the innerHTML of the property widget.
 */
export const formatPropertyForDisplay = (
    key: string,
    operator: string,
    values: string[]
): string => {
    // Sanitize values to prevent accidental HTML injection
    const escapeHtml = (unsafe: unknown) =>
        String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    const operatorSymbol = OPERATOR_MAP[operator] || operator;
    const keyHtml = `<span class="property-key">${escapeHtml(key)}</span>`;
    const operatorHtml = `<span class="property-operator">${operatorSymbol}</span>`;

    let valueHtml = '';

    // Handle the special 'between' operator which uses two values
    if (operator === 'between' && values.length >= 2) {
        const val1 = `<span class="property-value">${escapeHtml(values[0] || '')}</span>`;
        const val2 = `<span class="property-value">${escapeHtml(values[1] || '')}</span>`;
        valueHtml = `${val1}<span class="property-operator">&amp;</span>${val2}`;
    } else {
        // Handle all other operators (which use a single value)
        valueHtml = `<span class="property-value">${escapeHtml(values[0] || '')}</span>`;
    }

    return `${keyHtml}${operatorHtml}${valueHtml}`;
};

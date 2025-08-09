/**
 * Extracts plain text from an HTML string.
 * @param content - An HTML string.
 * @returns A single string containing all the text from the document.
 */
export function getTextFromHtml(content: string): string {
    if (!content) return '';

    const div = document.createElement('div');
    div.innerHTML = content;

    // Add newlines after block elements for better preview readability
    div
        .querySelectorAll('p, h1, h2, h3, li, blockquote, pre, div')
        .forEach((el) => {
            const br = document.createElement('br');
            el.appendChild(br);
        });

    return div.textContent || '';
}

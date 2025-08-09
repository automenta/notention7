/**
 * Calculates the character offset of the cursor within a container element.
 * This function creates a temporary range from the start of the container to the
 * cursor's position and returns the length of its text content. This is a robust
 * way to measure character offset across different node types.
 *
 * @param container - The contentEditable element that contains the selection.
 * @returns The character offset of the cursor from the start of the container.
 */
export const getCursorPosition = (container: HTMLElement): number => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return 0;
    }

    const range = selection.getRangeAt(0);
    // Create a range that spans from the start of the container to the cursor
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(container);
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    // The length of the text content of this range is the cursor position.
    // We replace widget elements with a single character to match the content model.
    return rangeToString(preCaretRange).length;
};

/**
 * Sets the cursor position within a container element to a specific character offset.
 * It traverses the DOM tree using a TreeWalker, node by node, until it finds the
 * text node and offset corresponding to the target position, then sets the
 - * selection range accordingly.
 *
 * @param container - The contentEditable element in which to set the cursor.
 * @param position - The character offset to place the cursor at.
 */
export const setCursorPosition = (container: HTMLElement, position: number) => {
    if (position < 0) return;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ALL);
    let charCount = 0;
    let targetNode: Node | null = null;

    while ((targetNode = walker.nextNode())) {
        if (targetNode.nodeType === Node.TEXT_NODE) {
            const len = targetNode.textContent?.length || 0;
            if (charCount + len >= position) {
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(targetNode, position - charCount);
                range.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(range);
                return;
            }
            charCount += len;
        } else if (targetNode.nodeType === Node.ELEMENT_NODE) {
            // Check if it's a widget, which we count as 1 character
            if ((targetNode as HTMLElement).classList.contains('widget')) {
                if (charCount === position) {
                    const range = document.createRange();
                    const sel = window.getSelection();
                    // Place cursor right before the widget
                    range.setStartBefore(targetNode);
                    range.collapse(true);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                    return;
                }
                charCount += 1;
            }
        }
    }

    // If the position is out of bounds, place it at the end of the container.
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(container);
    range.collapse(false); // false collapses to the end
    sel?.removeAllRanges();
    sel?.addRange(range);
};


/**
 * Converts a Range object to a string, replacing specific elements (like widgets)
 * with a single character representation ('\uFFFC', the object replacement character).
 * This is used to accurately calculate cursor position in an editor that contains
 * non-textual elements.
 *
 * @param range - The DOM Range to convert.
 * @returns A string representation of the range's content.
 */
function rangeToString(range: Range): string {
    const container = range.cloneContents();
    let str = '';

    function getNodeText(node: Node): void {
        if (node.nodeType === Node.TEXT_NODE) {
            str += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            // If it's a widget, represent it as a single character.
            // The object replacement character is a good choice for this.
            if (el.classList.contains('widget')) {
                str += '\uFFFC';
                return; // Don't process children of widgets
            }
            // Recurse for other elements
            for (let i = 0; i < node.childNodes.length; i++) {
                getNodeText(node.childNodes[i]);
            }
        }
    }

    for (let i = 0; i < container.childNodes.length; i++) {
        getNodeText(container.childNodes[i]);
    }

    return str;
}

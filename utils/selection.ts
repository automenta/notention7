import { EditorSelection } from '@/types';

/**
 * Maps the browser's current DOM selection to the editor's hierarchical content model.
 * @param editorRoot The root contentEditable element of the editor.
 * @returns An EditorSelection object or null if no selection exists.
 */
export const mapDomSelectionToModel = (editorRoot: HTMLElement): EditorSelection | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    let { startContainer, startOffset } = range;

    // Find the block and inline nodes corresponding to the selection point.
    let blockNode: Node | null = startContainer;
    let inlineNode: Node | null = startContainer;

    // If the selection is in a text node, the inline node is the text node itself.
    // The block node is its parent paragraph/div.
    if (inlineNode.nodeType === Node.TEXT_NODE) {
        blockNode = inlineNode.parentElement;
    }

    // Traverse up to find the root block element (e.g., <p>).
    while (blockNode && blockNode.parentElement !== editorRoot) {
        blockNode = blockNode.parentElement;
    }
    if (!blockNode) return null; // Selection is outside a valid block

    // Calculate blockIndex
    const blockIndex = Array.from(editorRoot.children).indexOf(blockNode as Element);

    // Calculate inlineIndex and offset
    let inlineIndex = 0;
    let offset = 0;
    let found = false;

    // Create a temporary range to count characters up to the cursor
    const preCaretRange = document.createRange();
    preCaretRange.selectNodeContents(blockNode);
    preCaretRange.setEnd(startContainer, startOffset);

    // Walk the inline nodes to find the index and offset
    const inlineNodes = Array.from((blockNode as Element).childNodes);
    for (let i = 0; i < inlineNodes.length; i++) {
        const currentInlineNode = inlineNodes[i];
        if (currentInlineNode === startContainer) {
            inlineIndex = i;
            offset = startOffset;
            found = true;
            break;
        }
        // If the selection is inside a text node that's a child of a span, etc.
        if (currentInlineNode.contains(startContainer)) {
             inlineIndex = i;
             // The offset needs to be calculated relative to the start of the inline node
             const tempRange = document.createRange();
             tempRange.selectNodeContents(currentInlineNode);
             tempRange.setEnd(startContainer, startOffset);
             offset = tempRange.toString().length;
             found = true;
             break;
        }
    }

    // A simplified fallback for when the selection is on the block itself
    if(!found && startContainer === blockNode) {
        inlineIndex = startOffset > 0 ? (blockNode as Element).childNodes.length - 1 : 0;
        offset = 0; // This is an approximation
    }


    return { blockIndex, inlineIndex, offset };
};


/**
 * Sets the browser's cursor to a position described by the editor's model selection.
 * @param editorRoot The root contentEditable element of the editor.
 * @param selection The EditorSelection object to apply.
 */
export const setCursorFromModelSelection = (editorRoot: HTMLElement, selection: EditorSelection): void => {
    const { blockIndex, inlineIndex, offset } = selection;

    const blockNode = editorRoot.children[blockIndex];
    if (!blockNode) return;

    let targetNode: Node | null = (blockNode as Element).childNodes[inlineIndex] || blockNode;
    let finalOffset = offset;

    // If the target is an element (like a widget), we might need to find a text node inside it
    // or place the cursor before/after it. For now, we simplify.
    // If the target is a text node, we can set the cursor directly.
    if (targetNode.nodeType === Node.ELEMENT_NODE) {
        // If it's a widget, place cursor before it. A more robust solution is needed here.
        if((targetNode as HTMLElement).classList.contains('widget')) {
            targetNode = blockNode;
            finalOffset = inlineIndex;
        } else {
             // Try to find the first text node inside
            let textNode = targetNode.firstChild;
            while(textNode && textNode.nodeType !== Node.TEXT_NODE) {
                textNode = textNode.firstChild;
            }
            if(textNode) targetNode = textNode;
        }
    }

    try {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(targetNode, finalOffset);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
    } catch (e) {
        console.error("Failed to set cursor from model selection", e, {selection, targetNode});
    }
};

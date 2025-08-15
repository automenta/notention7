import { ContentModel, EditorSelection, InlineNode, ParagraphNode } from '@/types';
import { produce } from 'immer';

// A Step represents a single, atomic change to the document.
export interface Step {
    apply: (doc: ContentModel) => ContentModel;
}

/**
 * A versatile step to replace a range of the document with new content.
 * This can be used for insertion (from === to), deletion (nodes is empty),
 * or replacement.
 * NOTE: This is still a simplified version that assumes the replacement
 * happens within a single block. A full implementation would need to handle
 * replacements that span multiple blocks.
 */
export class ReplaceStep implements Step {
    constructor(
        public readonly from: EditorSelection,
        public readonly to: EditorSelection,
        public readonly nodes: InlineNode[] = []
    ) {}

    apply(doc: ContentModel): ContentModel {
        if (this.from.blockIndex !== this.to.blockIndex) {
            console.error('ReplaceStep across blocks is not yet supported.');
            return doc;
        }

        return produce(doc, draft => {
            const block = draft[this.from.blockIndex] as ParagraphNode;
            if (!block || block.type !== 'paragraph') return;

            const { inlineIndex: fromInline, offset: fromOffset } = this.from;
            const { inlineIndex: toInline, offset: toOffset } = this.to;

            const newContent: InlineNode[] = [];
            // Add content before the replacement range
            for (let i = 0; i < fromInline; i++) {
                newContent.push(block.content[i]);
            }

            // Handle the start of the replacement
            const startNode = block.content[fromInline];
            if (startNode?.type === 'text') {
                newContent.push({ type: 'text', content: startNode.content.substring(0, fromOffset) });
            } else if (fromOffset === 0) {
                 newContent.push(startNode);
            }


            // Add the new nodes
            newContent.push(...this.nodes);

            // Handle the end of the replacement
            const endNode = block.content[toInline];
            if (endNode?.type === 'text') {
                newContent.push({ type: 'text', content: endNode.content.substring(toOffset) });
            } else if (toOffset === 0) {
                newContent.push(endNode);
            }


            // Add content after the replacement range
            for (let i = toInline + 1; i < block.content.length; i++) {
                newContent.push(block.content[i]);
            }

            // Basic normalization: merge adjacent text nodes
            const finalContent: InlineNode[] = [];
            for(const node of newContent) {
                const lastNode = finalContent[finalContent.length - 1];
                if (lastNode && lastNode.type === 'text' && node.type === 'text') {
                    lastNode.content += node.content;
                } else if (node.type === 'text' && node.content === '') {
                    // Do not push empty text nodes
                }
                else {
                    finalContent.push(node);
                }
            }

            block.content = finalContent;
        });
    }
}

/**
 * Splits a block at a given position.
 */
export class SplitBlockStep implements Step {
    constructor(public readonly at: EditorSelection) {}

    apply(doc: ContentModel): ContentModel {
        return produce(doc, draft => {
            const { blockIndex, inlineIndex, offset } = this.at;
            const blockToSplit = draft[blockIndex] as ParagraphNode;
            if (!blockToSplit || blockToSplit.type !== 'paragraph') return;

            const contentBefore = blockToSplit.content.slice(0, inlineIndex);
            const contentAfter: InlineNode[] = [];

            const nodeToSplit = blockToSplit.content[inlineIndex];
            if (nodeToSplit) {
                if (nodeToSplit.type === 'text') {
                    contentBefore.push({ type: 'text', content: nodeToSplit.content.substring(0, offset) });
                    contentAfter.push({ type: 'text', content: nodeToSplit.content.substring(offset) });
                } else {
                    // If splitting at a widget boundary
                    if (offset === 0) {
                        contentAfter.push(nodeToSplit);
                    } else {
                        contentBefore.push(nodeToSplit);
                    }
                }
            }

            // Add remaining nodes to the 'after' content
            contentAfter.push(...blockToSplit.content.slice(inlineIndex + 1));

            // Update the original block
            blockToSplit.content = contentBefore;

            // Create the new block
            const newBlock: ParagraphNode = {
                type: 'paragraph',
                content: contentAfter.length > 0 ? contentAfter : [{ type: 'text', content: '' }]
            };

            draft.splice(blockIndex + 1, 0, newBlock);
        });
    }
}

/**
 * Merges a block with its predecessor.
 */
export class MergeBlockStep implements Step {
    constructor(public readonly blockIndex: number) {}

    apply(doc: ContentModel): ContentModel {
        if (this.blockIndex === 0) return doc; // Cannot merge the first block

        return produce(doc, draft => {
            const blockToMerge = draft[this.blockIndex] as ParagraphNode;
            const targetBlock = draft[this.blockIndex - 1] as ParagraphNode;

            if (targetBlock && blockToMerge) {
                targetBlock.content.push(...blockToMerge.content);
                draft.splice(this.blockIndex, 1);
            }
        });
    }
}


// The Transaction class holds a collection of steps to be applied together.
export class Transaction {
    public steps: Step[] = [];
    public doc: ContentModel;
    public selection: EditorSelection | null = null;

    constructor(doc: ContentModel) {
        this.doc = doc;
    }

    addStep(step: Step): this {
        this.steps.push(step);
        return this;
    }

    setSelection(selection: EditorSelection): this {
        this.selection = selection;
        return this;
    }

    // Applies all steps in the transaction to produce a new state.
    apply(): { newDoc: ContentModel; newSelection: EditorSelection | null } {
        let newDoc = this.doc;
        for (const step of this.steps) {
            newDoc = step.apply(newDoc);
        }
        return { newDoc, newSelection: this.selection };
    }
}

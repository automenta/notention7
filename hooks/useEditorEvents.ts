import React, { useCallback } from 'react';
import type { EditorApi, EditorPlugin, InlineNode, TextNode } from '@/types';
import { mapDomSelectionToModel } from '@/utils/selection';
import { Transaction, SplitBlockStep, MergeBlockStep, ReplaceStep } from '@/utils/transaction';
import DOMPurify from 'dompurify';
import { parseHTML } from '@/utils/contentModel';

export const useEditorEvents = (
    plugins: EditorPlugin[],
    editorApi: EditorApi
) => {
    const handleInput = useCallback(
        (event: React.FormEvent<HTMLDivElement>) => {
            // This is now a fallback for complex inputs (IME, etc.)
            // that are not handled by specific keydown or paste events.
            console.log('Fallback handleInput triggered');
            editorApi.syncViewToModel();
        },
        [editorApi]
    );

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            for (const plugin of plugins) {
                if (plugin.onClick?.(event, editorApi)) {
                    return;
                }
            }
        },
        [plugins, editorApi]
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (editorApi.state.editingWidget) {
                if (
                    !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Tab'].includes(event.key)
                ) {
                    event.preventDefault();
                }
                return;
            }

            const selection = mapDomSelectionToModel(event.currentTarget);
            if (!selection) return;

            let tr = new Transaction(editorApi.state.contentModel);
            let handled = false;

            switch (event.key) {
                case 'Enter': {
                    if (!event.shiftKey) {
                        tr.addStep(new SplitBlockStep(selection));
                        const newSelection = {
                            blockIndex: selection.blockIndex + 1,
                            inlineIndex: 0,
                            offset: 0,
                        };
                        tr.setSelection(newSelection);
                        handled = true;
                    }
                    break;
                }

                case 'Backspace': {
                    const { blockIndex, inlineIndex, offset } = selection;
                    if (inlineIndex === 0 && offset === 0 && blockIndex > 0) {
                        // Merge with previous block
                        const prevBlock = editorApi.state.contentModel[blockIndex - 1];
                        const newSelection = {
                            blockIndex: blockIndex - 1,
                            inlineIndex: prevBlock.content.length,
                            offset: 0, // Simplified, should be end of last node
                        };
                        tr.addStep(new MergeBlockStep(blockIndex));
                        tr.setSelection(newSelection);
                        handled = true;
                    } else {
                        // Regular backspace within a block
                        const from = { ...selection, offset: offset - 1 };
                        tr.addStep(new ReplaceStep(from, selection, []));
                        tr.setSelection(from);
                        handled = true;
                    }
                    break;
                }
            }

            if (handled) {
                event.preventDefault();
                editorApi.dispatchTransaction(tr);
            }
        },
        [editorApi]
    );

    const handlePaste = useCallback(
        (event: React.ClipboardEvent<HTMLDivElement>) => {
            event.preventDefault();

            const pastedHtml = event.clipboardData.getData('text/html');
            const pastedText = event.clipboardData.getData('text/plain');
            let nodesToInsert: InlineNode[] = [];

            // Prioritize HTML content, as it may contain formatting.
            if (pastedHtml) {
                const sanitizedHtml = DOMPurify.sanitize(pastedHtml, { USE_PROFILES: { html: true } });
                if (sanitizedHtml) {
                    // The transaction system currently only supports single-line pastes.
                    // Enforce this by taking only the content before the first <br>.
                    const firstLineHtml = sanitizedHtml.split(/<br\s*\/?>/i)[0];
                    const newBlocks = parseHTML(firstLineHtml);
                    nodesToInsert = newBlocks[0]?.content || [];
                }
            }
            // Fallback to plain text if HTML is not available or was sanitized away.
            else if (pastedText) {
                // Take the first line of plain text.
                const firstLine = pastedText.split('\n')[0];
                if (firstLine) {
                    nodesToInsert = [{ type: 'text', content: firstLine }];
                }
            }

            if (nodesToInsert.length === 0) {
                return;
            }

            const selection = mapDomSelectionToModel(event.currentTarget);
            if (!selection) return;

            const tr = new Transaction(editorApi.state.contentModel);

            // Replace the current selection with the new nodes.
            tr.addStep(new ReplaceStep(selection, selection, nodesToInsert));

            // TODO: Set the selection to the end of the pasted content.
            // This is complex as it depends on the structure of nodesToInsert.
            // For now, the selection behavior might be slightly off after paste.

            editorApi.dispatchTransaction(tr);
        },
        [editorApi]
    );

    return { handleInput, handleClick, handleKeyDown, handlePaste };
};

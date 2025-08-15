import React, { useCallback } from 'react';
import type { EditorApi, EditorPlugin } from '@/types';
import { mapDomSelectionToModel } from '@/utils/selection';
import { Transaction, SplitBlockStep, MergeBlockStep, ReplaceStep } from '@/utils/transaction';

export const useEditorEvents = (
    plugins: EditorPlugin[],
    editorApi: EditorApi
) => {
    const handleInput = useCallback(
        (event: React.FormEvent<HTMLDivElement>) => {
            // This is now a fallback for complex inputs (IME, paste, etc.)
            // that are not handled by specific keydown events.
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

    return { handleInput, handleClick, handleKeyDown };
};

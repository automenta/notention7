import { EditorApi } from "../../../types/editor";
import { formatPropertyForDisplay } from "../../../utils/properties";

const processInputRules = (editorApi: EditorApi): boolean => {
    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE) return false;

    const textBeforeCaret = container.textContent?.substring(0, range.startOffset) || '';

    // Rule: [key:value]
    const propMatch = textBeforeCaret.match(/(\[([^:\]]+?):([^\]]*?)\])$/);
    if (propMatch) {
        const [fullMatch, , key, value] = propMatch.map(s => s || '');
        if (key.trim()) {
            const offsetToReplace = fullMatch.length;
            if (offsetToReplace > range.startOffset) return false;

            range.setStart(container, range.startOffset - offsetToReplace);
            range.deleteContents();

            const k = key.trim();
            const v = value.trim();
            const operator = 'is';
            const values = [v];

            const htmlToInsert = `<span class="widget property" contenteditable="false" data-key="${k}" data-operator="${operator}" data-values='${JSON.stringify(values)}'>${formatPropertyForDisplay(k, operator, values)}</span>&nbsp;`;

            editorApi.insertHtml(htmlToInsert);

            return true; // Event was handled
        }
    }
    return false;
};

export const inputRulesPlugin = {
    id: 'input-rules',
    name: 'Input Rules',
    onInput: (event: React.FormEvent<HTMLDivElement>, editorApi: EditorApi) => {
        return processInputRules(editorApi);
    },
};

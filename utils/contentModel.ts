import {
    BlockNode,
    ContentModel,
    InlineNode,
    PropertyWidgetNode,
    TagWidgetNode,
    TextNode,
    WidgetNode,
} from '@/types';
import {formatPropertyForDisplay} from './properties';

const parseInline = (element: HTMLElement): InlineNode[] => {
    const nodes: InlineNode[] = [];

    const processNode = (node: ChildNode) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent || '';
            if (textContent) {
                nodes.push({type: 'text', content: textContent});
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.classList.contains('widget')) {
                if (el.classList.contains('tag')) {
                    const tagNode: TagWidgetNode = {
                        type: 'widget',
                        kind: 'tag',
                        tag: el.dataset.tag || '',
                    };
                    nodes.push(tagNode);
                } else if (el.classList.contains('property')) {
                    let values: unknown[] = [];
                    try {
                        values = JSON.parse(el.dataset.values || '[]');
                    } catch (e) {
                        console.error('Failed to parse property values', e);
                        values = [];
                    }
                    const propertyNode: PropertyWidgetNode = {
                        type: 'widget',
                        kind: 'property',
                        id: el.id || `widget-${crypto.randomUUID()}`,
                        key: el.dataset.key || '',
                        operator: el.dataset.operator || 'is',
                        values: values,
                    };
                    nodes.push(propertyNode);
                }
            } else if (el.tagName === 'B' || el.tagName === 'I' || el.tagName === 'U' || el.tagName === 'SPAN') {
                // For simple inline formatting, recurse. A more robust solution
                // might handle these as specific node types.
                el.childNodes.forEach(processNode);
            }
        }
    };

    element.childNodes.forEach(processNode);
    return nodes;
};

export const parseHTML = (html: string): ContentModel => {
    const container = document.createElement('div');
    container.innerHTML = html;
    const blocks: BlockNode[] = [];

    // If the content is empty, return a single empty paragraph
    if (!container.childNodes.length) {
        return [{type: 'paragraph', content: [{type: 'text', content: ''}]}];
    }

    container.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            // Treat divs and paragraphs as block containers
            if (el.tagName === 'P' || el.tagName === 'DIV') {
                blocks.push({
                    type: 'paragraph',
                    content: parseInline(el),
                });
            }
        } else {
            // If there's floating content not in a block, wrap it. This can happen
            // with poorly formatted or legacy content.
            const inlineContent = parseInline(container);
            if (inlineContent.length > 0) {
                blocks.push({type: 'paragraph', content: inlineContent});
            }
        }
    });

    // Ensure there's always at least one block
    if (blocks.length === 0) {
        // This can happen if the HTML contains only text nodes or inline elements at the top level
        const inlineContent = parseInline(container);
        blocks.push({type: 'paragraph', content: inlineContent.length > 0 ? inlineContent : [{type: 'text', content: ''}]});
    }

    return blocks;
};

const serializeInlineToHTML = (nodes: InlineNode[]): string => {
    if (!nodes) return '';
    return nodes
        .map((node) => {
            if (node.type === 'text') {
                // Basic HTML escaping
                return node.content
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }
            if (node.type === 'widget') {
                const widgetNode = node as WidgetNode;
                if (widgetNode.kind === 'tag') {
                    const tagNode = widgetNode as TagWidgetNode;
                    return `<span class="widget tag" contenteditable="false" data-tag="${tagNode.tag}">#${tagNode.tag}</span>`;
                }
                if (widgetNode.kind === 'property') {
                    const propNode = widgetNode as PropertyWidgetNode;
                    const valuesJson = JSON.stringify(propNode.values).replace(/'/g, '&apos;');
                    const displayText = formatPropertyForDisplay(
                        propNode.key,
                        propNode.operator,
                        propNode.values as string[]
                    );
                    return `<span id="${propNode.id}" class="widget property" contenteditable="false" data-key="${propNode.key}" data-operator="${propNode.operator}" data-values='${valuesJson}'>${displayText}</span>`;
                }
            }
            return '';
        })
        .join('');
};

export const serializeToHTML = (model: ContentModel): string => {
    if (!model) return '';
    return model
        .map((block) => {
            if (block.type === 'paragraph') {
                const inlineHTML = serializeInlineToHTML(block.content);
                // Return a zero-width space if the paragraph is empty to ensure it's rendered correctly
                return `<p>${inlineHTML || '&#8203;'}</p>`;
            }
            return '';
        })
        .join('');
};

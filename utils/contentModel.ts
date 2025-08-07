import {
  ContentNode,
  PropertyWidgetNode,
  TagWidgetNode,
  TextNode,
} from '../types';

export const parseHTML = (html: string): ContentNode[] => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const nodes: ContentNode[] = [];

  const processNode = (node: ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent || '';
      // HTML parsing can create empty text nodes between elements, ignore them.
      if (textContent.trim() === '' && nodes.length > 0) {
        // preserve spaces between widgets
        const lastNode = nodes[nodes.length - 1];
        if (lastNode.type === 'widget') {
          nodes.push({ type: 'text', content: ' ' });
        }
        return;
      }
      if (textContent) {
        nodes.push({ type: 'text', content: textContent });
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
      } else {
        // For now, we don't handle nested elements, just recurse.
        // This could be improved to handle formatting like bold/italic.
        el.childNodes.forEach(processNode);
      }
    }
  };

  container.childNodes.forEach(processNode);

  return nodes;
};

export const serializeToHTML = (nodes: ContentNode[]): string => {
  if (!nodes) return '';
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return node.content;
      }
      if (node.type === 'widget') {
        if (node.kind === 'tag') {
          const tagNode = node as TagWidgetNode;
          return `<span class="widget tag" contenteditable="false" data-tag="${tagNode.tag}">#${tagNode.tag}</span>`;
        }
        if (node.kind === 'property') {
          const propNode = node as PropertyWidgetNode;
          const valuesJson = JSON.stringify(propNode.values);
          // Use formatPropertyForDisplay for the text content
          const displayText = `[${propNode.key}:${propNode.operator}:${propNode.values.join(',')}]`;
          return `<span id="${propNode.id}" class="widget property" contenteditable="false" data-key="${propNode.key}" data-operator="${propNode.operator}" data-values='${valuesJson}'>${displayText}</span>`;
        }
      }
      return '';
    })
    .join('');
};

import { formatPropertyForDisplay } from './properties';

// A one-time conversion for legacy note content from plain text to widgets.
export const convertPlainTextToWidgets = (html: string): string => {
  if (!html) return html;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // If widgets already exist, assume it's modern format
  if (tempDiv.querySelector('.widget[data-operator]')) return html;

  let widgetizedHtml = html;
  // Regex for legacy [key:value] format
  const propertyRegex = /\[\s*([^:<>]+?)\s*:\s*([^\]<>]*?)\s*\]/g;
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)/g;

  widgetizedHtml = widgetizedHtml.replace(
    propertyRegex,
    (match, key, value) => {
      const k = key.trim();
      const v = value ? value.trim() : '';
      const operator = 'is';
      const values = [v];
      return `<span class="widget property" contenteditable="false" data-key="${k}" data-operator="${operator}" data-values='${JSON.stringify(values)}'>${formatPropertyForDisplay(k, operator, values)}</span>`;
    }
  );

  widgetizedHtml = widgetizedHtml.replace(tagRegex, (match, tag) => {
    const prefix = match.startsWith(' ') ? ' ' : '';
    return `${prefix}<span class="widget tag" contenteditable="false" data-tag="${tag}">#${tag}</span>`;
  });

  return widgetizedHtml;
};

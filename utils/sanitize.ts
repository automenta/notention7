import DOMPurify from 'dompurify';

export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ['span'],
    ADD_ATTR: ['class', 'id', 'contenteditable', 'data-tag', 'data-key', 'data-operator', 'data-values'],
  });
};

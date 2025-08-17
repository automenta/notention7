import { useEffect, useRef } from 'react';
import type { Note, ContentNode } from '../types';

const AUTO_SAVE_DEBOUNCE_MS = 1000;

export const useAutoSave = (
  note: Note,
  content: string,
  contentModel: ContentNode[],
  onSave: (note: Note) => void
) => {
  const noteRef = useRef(note);
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  useEffect(() => {
    const isInitialMount = noteRef.current.content === content;

    const handler = setTimeout(() => {
      if (noteRef.current.content === content) {
        return;
      }

      if (isInitialMount) {
        return;
      }

      const newTags: string[] = [];
      const newProperties: Note['properties'] = [];
      contentModel.forEach((node) => {
        if (node.type === 'widget') {
          if (node.kind === 'tag') {
            newTags.push(node.tag);
          } else if (node.kind === 'property') {
            newProperties.push({
              key: node.key,
              op: node.operator,
              values: node.values as string[],
            });
          }
        }
      });

      onSave({
        ...noteRef.current,
        content: content,
        tags: newTags,
        properties: newProperties,
        updatedAt: new Date().toISOString(),
      });
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [content, contentModel, onSave, noteRef]);
};

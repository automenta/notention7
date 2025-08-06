import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Note } from '../types';
import { getTextFromHtml } from '../utils/nostr';

interface TextareaEditorProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const TextareaEditor: React.FC<TextareaEditorProps> = ({
  note,
  onSave,
}) => {
  const [content, setContent] = useState(getTextFromHtml(note.content));
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setContent(getTextFromHtml(note.content));
  }, [note.id, note.content]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      onSave({ ...note, content, updatedAt: new Date().toISOString() });
    }, 500);
  }, [note, onSave, content]);

  useEffect(() => {
    debouncedSave();
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [content, debouncedSave]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg overflow-hidden p-4">
      <textarea
        className="flex-1 w-full h-full bg-transparent text-gray-200 resize-none outline-none focus:ring-0"
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing..."
      />
      <div className="flex-shrink-0 p-2 text-xs text-center text-gray-500 border-t border-gray-700/50 mt-4">
        {note.nostrEventId && note.publishedAt
          ? `Published on Nostr: ${new Date(note.publishedAt).toLocaleString()}`
          : `Last saved: ${new Date(note.updatedAt).toLocaleString()}`}
      </div>
    </div>
  );
};

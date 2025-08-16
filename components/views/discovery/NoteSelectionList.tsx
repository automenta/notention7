import React from 'react';
import { Note } from '@/types';
import { NoteListItem } from '../../sidebar/NoteListItem';

interface NoteSelectionListProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
}

export const NoteSelectionList: React.FC<NoteSelectionListProps> = ({
  notes,
  onSelectNote,
}) => {
  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
          isSelected={false}
          onSelect={() => onSelectNote(note.id)}
          onDelete={() => {}}
        />
      ))}
    </div>
  );
};

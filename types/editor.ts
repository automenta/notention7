
import React from 'react';
import { Note, AppSettings } from './index'; // Assuming index.ts exports these

export interface EditorPlugin {
    id: string;
    name: string;
    component: React.FC<{
        note: Note;
        onSave: (note: Note) => void;
        onDelete: (id: string) => void;
        settings: AppSettings;
    }>;
}

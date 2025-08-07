import { createContext } from 'react';
import type { View } from '../../types';

export interface ViewContextType {
  activeView: View;
  setActiveView: (view: View) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

export const ViewContext = createContext<ViewContextType | undefined>(undefined);

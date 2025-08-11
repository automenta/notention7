import { createContext, useContext } from 'react';
import type { View } from '../../types';

export interface ViewContextType {
  activeView: View;
  setActiveView: (view: View) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

export const ViewContext = createContext<ViewContextType | undefined>(
  undefined
);

export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
};

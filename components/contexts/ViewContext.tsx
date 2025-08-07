import React, { createContext, ReactNode, useState } from 'react';
import type { View } from '../../types';

interface ViewContextType {
  activeView: View;
  setActiveView: (view: View) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

export const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeView, setActiveView] = useState<View>('notes');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  return (
    <ViewContext.Provider
      value={{ activeView, setActiveView, selectedNoteId, setSelectedNoteId }}
    >
      {children}
    </ViewContext.Provider>
  );
};


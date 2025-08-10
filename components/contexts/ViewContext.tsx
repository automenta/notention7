import React, { createContext, ReactNode, useContext, useState } from 'react';
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

export const ViewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeView, setActiveView] = useState<View>('notes');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const contextValue: ViewContextType = {
    activeView,
    setActiveView,
    selectedNoteId,
    setSelectedNoteId,
  };

  return (
    <ViewContext.Provider value={contextValue}>{children}</ViewContext.Provider>
  );
};

export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
};

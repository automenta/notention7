import React, { ReactNode, useState, useContext } from 'react';
import type { View } from '../../types';
import { ViewContext } from './view';

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

export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
};

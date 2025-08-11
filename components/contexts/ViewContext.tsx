import React, { ReactNode, useState } from 'react';
import type { View } from '../../types';
import { ViewContext, ViewContextType } from './view.context';

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

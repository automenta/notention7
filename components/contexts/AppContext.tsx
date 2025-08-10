import React, { ReactNode } from 'react';
import { SettingsProvider } from './SettingsContext';
import { ViewProvider } from './ViewContext';
import { NotesProvider } from './NotesContext';
import { NotificationProvider } from './NotificationContext';

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <NotificationProvider>
      <SettingsProvider>
        <ViewProvider>
          <NotesProvider>{children}</NotesProvider>
        </ViewProvider>
      </SettingsProvider>
    </NotificationProvider>
  );
};

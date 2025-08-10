import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification } from '../common/Notification';

type NotificationContextType = {
  addNotification: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const addNotification = useCallback((message: string) => {
    setNotification(message);
  }, []);

  const handleDone = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notification && <Notification message={notification} onDone={handleDone} />}
    </NotificationContext.Provider>
  );
};

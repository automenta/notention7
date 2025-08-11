import React, { useState, useCallback } from 'react';
import { Notification } from '../common/Notification';
import { NotificationContext } from './notification.context';

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

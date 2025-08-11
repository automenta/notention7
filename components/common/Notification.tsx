import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  onDone: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 3000); // Hide after 3 seconds

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg animate-fadeInOut">
      {message}
    </div>
  );
};

// We'll need to add the fadeInOut animation to our CSS/tailwind config later if it doesn't exist.
// For now, this component structure is a good start.

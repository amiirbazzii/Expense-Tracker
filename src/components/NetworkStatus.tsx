'use client';

import { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set the initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div 
      className="fixed top-4 right-4 z-50"
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'You are online' : 'You are offline - changes will sync when reconnected'}
      title={isOnline ? 'You are online' : 'You are offline - changes will sync when reconnected'}
    >
      <div 
        className={`w-3 h-3 rounded-full shadow-sm ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
        aria-hidden="true"
      />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

export function PWAOfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      console.log('🌐 App is back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      console.log('📵 App is offline');
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide offline message after 5 seconds
    if (!isOnline) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  if (!showOfflineMessage) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center space-x-2">
        <span className="animate-pulse">📵</span>
        <span>You're offline. Some features may not work.</span>
        <button
          onClick={() => setShowOfflineMessage(false)}
          className="ml-2 text-yellow-700 hover:text-yellow-800"
        >
          ×
        </button>
      </div>
    </div>
  );
}

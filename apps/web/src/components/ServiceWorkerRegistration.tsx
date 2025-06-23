'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker in both dev and production for PWA testing
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered successfully:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('🔄 New content available, please refresh');
                    // You could show a notification to user here
                  } else {
                    console.log('📱 Content cached for offline use');
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('📬 Message from service worker:', event.data);
      });
    }
  }, []);

  return null;
}

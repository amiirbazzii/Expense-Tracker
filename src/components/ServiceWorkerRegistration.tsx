'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ServiceWorkerRegistration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      let registration: ServiceWorkerRegistration | null = null;
      
      const registerServiceWorker = async () => {
        try {
          registration = await navigator.serviceWorker.register('/sw.js');
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration?.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                // When the new service worker is installed, prompt the user to update
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // You could show a toast or banner here to inform the user
                  console.log('New content is available; please refresh.');
                }
              });
            }
          });

          // Listen for the controllerchange event to refresh the page
          // when a new service worker takes control
          const onControllerChange = () => {
            window.location.reload();
          };
          
          navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

          // Clean up event listeners
          return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
          };
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      };

      // Check if the page is already loaded
      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
      }

      // Clean up the event listener
      return () => {
        window.removeEventListener('load', registerServiceWorker);
      };
    }
  }, []);

  // Check for service worker updates when the route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().catch(console.error);
      });
    }
  }, [pathname]);

  return null;
}

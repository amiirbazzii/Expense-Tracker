// This file is a service worker that provides offline functionality and caching
// for the expense tracker application.

// Import Workbox libraries from CDN
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js'
);

// Ensure the service worker takes control of the page as soon as possible
workbox.core.clientsClaim();

// Cache name for the application shell
const CACHE_NAME = 'expense-tracker-v1';
const OFFLINE_URL = '/offline.html';

// Precache the offline page and other critical assets
workbox.precaching.precacheAndRoute([
  { url: OFFLINE_URL, revision: '1' },
  { url: '/manifest.json', revision: '1' },
  // Add other critical assets here
]);

// Serve the app shell for navigation requests
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
workbox.routing.registerRoute(
  ({ request, url }) => {
    // Skip requests with extensions (e.g., .js, .css, .json, etc.)
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/_next/')) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      {
        handlerDidError: async ({ request }) => {
          return await caches.match(OFFLINE_URL, { ignoreSearch: true });
        },
      },
    ],
  })
);

// Cache API responses with a network-first strategy
workbox.routing.registerRoute(
  /^https?:\/\/api\..*\/expenses/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
);

// Background sync for failed POST requests
const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('expenseQueue', {
  maxRetentionTime: 24 * 60, // Retry for max 24 hours
});

// Handle form submissions with background sync
workbox.routing.registerRoute(
  ({url}) => url.pathname.endsWith('/api/expenses') && url.searchParams.get('_method') !== 'GET',
  new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Cache Google Fonts with a stale-while-revalidate strategy
workbox.routing.registerRoute(
  /^https?:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year
workbox.routing.registerRoute(
  /^https?:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache static assets with a cache-first strategy
workbox.routing.registerRoute(
  /\/(_next|static)\/.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)/,
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Show a notification when the app is updated
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Clean up old caches when a new service worker is activated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

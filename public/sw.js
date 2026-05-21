const CACHE_NAME = 'sahasetu-pwa-cache-v1';
const OFFLINE_URL = '/offline-fallback';

// Assets to pre-cache immediately
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
];

// Offline HTML compiled dynamically to avoid hitting the server when offline
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaahasSetu - Offline Mode</title>
  <style>
    :root {
      --primary: #f43f5e;
      --primary-dark: #be123c;
      --bg: #0a0a0a;
      --text: #fafafa;
      --text-secondary: #a1a1aa;
      --card: #18181b;
      --border: #27272a;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    }
    .container {
      max-width: 450px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .icon-box {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.4);
    }
    .icon-box svg {
      width: 40px;
      height: 40px;
      fill: none;
      stroke: white;
      stroke-width: 2;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 12px 0;
      background: linear-gradient(135deg, #ffffff, var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 30px 0;
    }
    .btn {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      border: none;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.3);
    }
    .badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(244, 63, 94, 0.15);
      color: var(--primary);
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Offline Mode</div>
    <div class="icon-box">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke-width="2.5"></path>
      </svg>
    </div>
    <h1>Connection Lost</h1>
    <p>SaahasSetu secure reporting dashboard is currently offline. Your existing reports and encrypted local credentials remain safe. Please check your internet connection and try again.</p>
    <button class="btn" onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>
`;

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      // Cache basic assets + construct the offline fallback cache entry
      const cacheOfflinePage = cache.put(
        new Request(OFFLINE_URL),
        new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        })
      );
      const cacheStatics = cache.addAll(STATIC_ASSETS);
      return Promise.all([cacheOfflinePage, cacheStatics]);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS (skip chrome-extension, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle page navigations and API/static requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, try to return cached offline fallback page
          return caches.match(OFFLINE_URL);
        })
    );
  } else {
    // For assets/images/fonts: Network-First falling back to Cache
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response but refresh in background (Stale-While-Revalidate pattern)
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {/* Ignore bg errors */});
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache static assets and next chunks dynamically
            const url = event.request.url;
            if (
              url.includes('/_next/static/') ||
              url.includes('/fonts/') ||
              url.endsWith('.png') ||
              url.endsWith('.jpg') ||
              url.endsWith('.svg') ||
              url.endsWith('.css') ||
              url.endsWith('.js')
            ) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }

            return response;
          })
          .catch(() => {
            // Fallback for image requests when offline
            if (event.request.url.match(/\\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/icon-192.png');
            }
          });
      })
    );
  }
});

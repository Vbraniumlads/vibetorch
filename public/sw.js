const CACHE_NAME = "vibetorch-v3";
const urlsToCache = ["/torch.webp", "/favicon.ico"];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Fetch event - Use network-first strategy for HTML, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for API requests and other dynamic content
  if (url.pathname.startsWith("/api/")) {
    // Let these requests go directly to network
    return;
  }

  // For HTML documents, use network-first strategy
  if (
    request.mode === "navigate" ||
    request.destination === "document" ||
    request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache successful responses
            if (response.status === 200) {
              cache.put(request, responseToCache);
            }
          });
          return response;
        })
        .catch(() => {
          // Only use cache as fallback when network fails
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Return a proper offline page if available
            return new Response(
              "<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your connection and reload.</p></body></html>",
              { headers: { "Content-Type": "text/html" } }
            );
          });
        })
    );
    return;
  }

  // For assets (images, JS, CSS), use cache-first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }
        // Clone the response before caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      clients.claim(),
    ])
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline actions when back online
  return new Promise((resolve) => {
    // Add your background sync logic here
    resolve();
  });
}

// Push notification handling
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Default notification body",
    icon: "/torch.webp",
    badge: "/torch.webp",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification("vibetorch", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});

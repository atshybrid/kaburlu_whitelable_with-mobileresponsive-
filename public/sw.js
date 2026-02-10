/**
 * Service Worker for Push Notifications
 * 
 * This service worker handles:
 * - Push notification events
 * - Notification clicks
 * - Background sync
 * 
 * Place this file in /public/sw.js
 */

// Listen for push events
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const title = data.title || 'New Notification'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    image: data.image,
    data: {
      url: data.url || '/',
    },
    tag: data.tag || 'default',
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // If not, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      })
  )
})

// Install event
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', () => {
  self.clients.claim()
})

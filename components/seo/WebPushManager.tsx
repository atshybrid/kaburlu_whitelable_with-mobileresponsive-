'use client'

import { useEffect, useState } from 'react'

/**
 * Web Push Notification Manager
 * 
 * Handles FCM (Firebase Cloud Messaging) and VAPID web push notifications.
 * 
 * Features:
 * - Request notification permission
 * - Subscribe to push notifications
 * - Handle push events
 * 
 * Usage:
 * ```tsx
 * import { WebPushManager } from '@/components/seo/WebPushManager'
 * 
 * <WebPushManager 
 *   vapidPublicKey="YOUR_VAPID_KEY"
 *   fcmSenderId="YOUR_FCM_SENDER_ID"
 * />
 * ```
 */

interface WebPushManagerProps {
  vapidPublicKey?: string | null
  fcmSenderId?: string | null
  enabled?: boolean
}

export function WebPushManager({
  vapidPublicKey,
  fcmSenderId,
  enabled = true,
}: WebPushManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  // Check if browser supports notifications on mount
  useEffect(() => {
    const checkSupport = () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setIsSupported(true)
        setPermission(Notification.permission)
      }
    }
    checkSupport()
  }, [])

  useEffect(() => {
    if (!enabled || !isSupported || !vapidPublicKey) {
      return
    }

    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }
  }, [enabled, isSupported, vapidPublicKey])

  const requestPermission = async () => {
    if (!isSupported) return

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === 'granted') {
        console.log('✅ Notification permission granted')
        await subscribeToPush()
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error)
    }
  }

  const subscribeToPush = async () => {
    if (!vapidPublicKey || !('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })

      // Send subscription to your backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          fcmSenderId,
        }),
      })

      console.log('✅ Push subscription successful')
    } catch (error) {
      console.error('❌ Push subscription failed:', error)
    }
  }

  if (!enabled || !isSupported) {
    return null
  }

  return (
    <>
      {/* Hidden component - manages push notifications */}
      {permission === 'default' && (
        <button
          onClick={requestPermission}
          className="hidden"
          aria-label="Enable push notifications"
        />
      )}
    </>
  )
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as Uint8Array
}

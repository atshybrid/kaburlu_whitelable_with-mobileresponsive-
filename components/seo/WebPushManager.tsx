'use client'

import { useCallback, useEffect, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WebPushManagerProps {
  vapidPublicKey?: string | null
  fcmSenderId?: string | null
  enabled?: boolean
}

// Subscription state: null = loading/checking, false = not subscribed, true = subscribed
type SubscribedState = boolean | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

async function getServiceWorkerReg() {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.ready
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WebPushManager({
  vapidPublicKey,
  fcmSenderId,
  enabled = true,
}: WebPushManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState<SubscribedState>(null) // null = still checking
  const [isBusy, setIsBusy] = useState(false)

  // ── 1. Detect browser support + current permission ──────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return
    setIsSupported(true)
    setPermission(Notification.permission)
  }, [])

  // ── 2. Register SW + check existing subscription on mount ───────────────────
  useEffect(() => {
    if (!enabled || !isSupported || !vapidPublicKey) return

    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        console.log('✅ Service Worker registered')
        // Browser-local check — no backend call needed
        const existing = await reg.pushManager.getSubscription()
        setIsSubscribed(existing !== null)

        // Silent re-sync: if already subscribed, re-POST to backend (upsert safe)
        if (existing) {
          void syncSubscriptionToBackend(existing, fcmSenderId ?? null)
        }
      })
      .catch((err) => console.error('❌ SW registration failed:', err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isSupported, vapidPublicKey])

  // ── 3. Subscribe ─────────────────────────────────────────────────────────────
  const handleSubscribe = useCallback(async () => {
    if (!enabled || !vapidPublicKey || isBusy) return

    try {
      setIsBusy(true)
      const currentPermission = await Notification.requestPermission()
      setPermission(currentPermission)
      if (currentPermission !== 'granted') return

      const reg = await getServiceWorkerReg()
      if (!reg) return

      const existing = await reg.pushManager.getSubscription()
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        }))

      await syncSubscriptionToBackend(sub, fcmSenderId ?? null)
      setIsSubscribed(true)
      console.log('✅ Push subscribed')
    } catch (err) {
      console.error('❌ Subscribe error:', err)
    } finally {
      setIsBusy(false)
    }
  }, [enabled, fcmSenderId, isBusy, vapidPublicKey])

  // ── 4. Unsubscribe ────────────────────────────────────────────────────────────
  const handleUnsubscribe = useCallback(async () => {
    if (isBusy) return
    try {
      setIsBusy(true)
      const reg = await getServiceWorkerReg()
      if (!reg) return

      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        // Notify backend first (so it marks isActive=false)
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }

      setIsSubscribed(false)
      console.log('✅ Push unsubscribed')
    } catch (err) {
      console.error('❌ Unsubscribe error:', err)
    } finally {
      setIsBusy(false)
    }
  }, [isBusy])

  // ── Render ────────────────────────────────────────────────────────────────────
  if (!enabled || !isSupported || permission === 'denied') return null

  // Still checking browser subscription — show nothing yet
  if (isSubscribed === null) return null

  return (
    <button
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      disabled={isBusy}
      className="fixed bottom-4 right-4 z-[70] flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
      aria-label={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
    >
      {isBusy
        ? '...'
        : isSubscribed
          ? '🔔 Notifications On'
          : '🔕 Enable Notifications'}
    </button>
  )
}

// ─── Backend sync (silent upsert) ─────────────────────────────────────────────

async function syncSubscriptionToBackend(
  sub: PushSubscription,
  fcmSenderId: string | null,
): Promise<void> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, fcmSenderId }),
    })
    if (!response.ok) throw new Error(`API ${response.status}`)
  } catch (err) {
    console.warn('⚠️ Push sync to backend failed (non-fatal):', err)
  }
}

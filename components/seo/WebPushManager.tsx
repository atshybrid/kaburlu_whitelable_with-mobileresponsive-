'use client'

import { useCallback, useEffect, useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const DISMISS_KEY = 'push_prompt_dismissed_at'
const DISMISS_DAYS = 7          // re-show popup after 7 days if user clicked "No thanks"
const POPUP_DELAY_MS = 4000     // show popup 4 seconds after page load

// ─── Types ────────────────────────────────────────────────────────────────────

interface WebPushManagerProps {
  vapidPublicKey?: string | null
  fcmSenderId?: string | null
  enabled?: boolean
}

type SubscribedState = boolean | null // null = still checking

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

function isDismissed(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    return Date.now() - Number(ts) < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function saveDismiss() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WebPushManager({
  vapidPublicKey,
  fcmSenderId,
  enabled = true,
}: WebPushManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState<SubscribedState>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [visible, setVisible] = useState(false) // CSS transition trigger

  // ── 1. Detect support + permission ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return
    setIsSupported(true)
    setPermission(Notification.permission)
  }, [])

  // ── 2. Register SW + browser subscription check ──────────────────────────────
  useEffect(() => {
    if (!enabled || !isSupported || !vapidPublicKey) return

    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        const existing = await reg.pushManager.getSubscription()
        setIsSubscribed(existing !== null)
        if (existing) void syncSubscriptionToBackend(existing, fcmSenderId ?? null)
      })
      .catch((err) => console.error('❌ SW registration failed:', err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isSupported, vapidPublicKey])

  // ── 3. Show popup after delay (only if not already subscribed / denied / dismissed) ──
  useEffect(() => {
    if (!enabled || !isSupported || permission !== 'default') return
    if (isSubscribed !== false) return // wait until we know for sure not subscribed
    if (isDismissed()) return

    const timer = setTimeout(() => {
      setShowPopup(true)
      // small delay so the CSS transition plays from off-screen
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }, POPUP_DELAY_MS)

    return () => clearTimeout(timer)
  }, [enabled, isSupported, isSubscribed, permission])

  // ── 4. Subscribe ─────────────────────────────────────────────────────────────
  const handleSubscribe = useCallback(async () => {
    if (!enabled || !vapidPublicKey || isBusy) return
    try {
      setIsBusy(true)
      const currentPermission = await Notification.requestPermission()
      setPermission(currentPermission)
      closePopup()
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
    } catch (err) {
      console.error('❌ Subscribe error:', err)
    } finally {
      setIsBusy(false)
    }
  }, [enabled, fcmSenderId, isBusy, vapidPublicKey])

  // ── 5. Unsubscribe ────────────────────────────────────────────────────────────
  const handleUnsubscribe = useCallback(async () => {
    if (isBusy) return
    try {
      setIsBusy(true)
      const reg = await getServiceWorkerReg()
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('❌ Unsubscribe error:', err)
    } finally {
      setIsBusy(false)
    }
  }, [isBusy])

  // ── 6. Dismiss popup ──────────────────────────────────────────────────────────
  function closePopup() {
    setVisible(false)
    setTimeout(() => setShowPopup(false), 300) // wait for slide-out transition
  }

  function handleDismiss() {
    saveDismiss()
    closePopup()
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  if (!enabled || !isSupported || permission === 'denied') return null
  if (isSubscribed === null) return null // still loading

  return (
    <>
      {/* ── Permission prompt popup ── */}
      {showPopup && !isSubscribed && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Enable notifications"
          className={`fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 transition-all duration-300 ease-out sm:left-auto sm:right-4 sm:translate-x-0 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10 dark:bg-zinc-900 dark:ring-white/10">
            {/* Header */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl dark:bg-red-900/30">
                🔔
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Breaking news alerts
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Get notified the moment top stories break — no spam, turn off anytime.
                </p>
              </div>
              {/* Close ✕ */}
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-full p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSubscribe}
                disabled={isBusy}
                className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isBusy ? 'Enabling…' : 'Allow'}
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                No thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Subscribed indicator (small bell in corner) ── */}
      {isSubscribed && (
        <button
          onClick={handleUnsubscribe}
          disabled={isBusy}
          title="Notifications on — click to disable"
          className="fixed bottom-4 right-4 z-[70] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lg shadow-lg transition-opacity hover:opacity-80 disabled:opacity-50 dark:bg-zinc-100"
          aria-label="Disable push notifications"
        >
          🔔
        </button>
      )}
    </>
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

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWebPush } from '@/hooks/useWebPush'
import { isPushDismissed, savePushDismiss } from '@/lib/push-utils'

const DISMISS_DAYS = 7
const POPUP_DELAY_MS = 4000

const POPUP_LABELS: Record<string, { title: string; body: string; allow: string; dismiss: string; enabling: string }> = {
  te: {
    title: 'బ్రేకింగ్ న్యూస్ అలర్ట్లు',
    body: 'ముఖ్యమైన వార్తలు వెంటనే తెలుసుకోండి — స్పామ్ లేదు, ఎప్పుడైనా ఆఫ్ చేయవచ్చు.',
    allow: 'అనుమతించు',
    dismiss: 'వద్దు',
    enabling: 'ఆన్ అవుతోంది…',
  },
  en: {
    title: 'Breaking news alerts',
    body: 'Get notified the moment top stories break — no spam, turn off anytime.',
    allow: 'Allow',
    dismiss: 'No thanks',
    enabling: 'Enabling…',
  },
}

function popupLang(): string {
  if (typeof document === 'undefined') return 'te'
  const raw = document.documentElement.lang || 'te'
  return raw.split('-')[0] || 'te'
}

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
  const { permission, isSupported, isSubscribed, isBusy, handleSubscribe } =
    useWebPush({ vapidPublicKey, fcmSenderId, enabled })

  const [showPopup, setShowPopup] = useState(false)
  const [visible, setVisible] = useState(false)
  const labels = POPUP_LABELS[popupLang()] || POPUP_LABELS.te

  useEffect(() => {
    if (!enabled || !isSupported || permission !== 'default') return
    if (isSubscribed !== false) return
    if (isPushDismissed('push_prompt_dismissed_at', DISMISS_DAYS)) return

    const timer = setTimeout(() => {
      setShowPopup(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }, POPUP_DELAY_MS)

    return () => clearTimeout(timer)
  }, [enabled, isSupported, isSubscribed, permission])

  const closePopup = useCallback(() => {
    setVisible(false)
    setTimeout(() => setShowPopup(false), 300)
  }, [])

  const onAllow = useCallback(async () => {
    const ok = await handleSubscribe()
    closePopup()
    if (!ok && Notification.permission !== 'granted') return
  }, [closePopup, handleSubscribe])

  const onDismiss = useCallback(() => {
    savePushDismiss('push_prompt_dismissed_at')
    closePopup()
  }, [closePopup])

  if (!enabled || !isSupported || permission === 'denied') return null
  if (isSubscribed === null) return null

  return (
    <>
      {showPopup && !isSubscribed && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Enable notifications"
          className={`fixed bottom-20 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 transition-all duration-300 ease-out sm:bottom-4 sm:left-auto sm:right-4 sm:translate-x-0 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl">
                🔔
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-900">{labels.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{labels.body}</p>
              </div>
              <button
                onClick={onDismiss}
                className="shrink-0 rounded-full p-1 text-zinc-400 hover:text-zinc-700"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void onAllow()}
                disabled={isBusy}
                className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isBusy ? labels.enabling : labels.allow}
              </button>
              <button
                onClick={onDismiss}
                className="flex-1 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
              >
                {labels.dismiss}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

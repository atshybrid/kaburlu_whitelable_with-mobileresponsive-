'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWebPush } from '@/hooks/useWebPush'
import { isPushDismissed, savePushDismiss } from '@/lib/push-utils'

const DISMISS_DAYS = 7
const POPUP_DELAY_MS = 5000

const POPUP_LABELS: Record<string, { title: string; body: string; allow: string; dismiss: string; enabling: string }> = {
  te: {
    title: 'బ్రేకింగ్ న్యూస్ అలర్ట్లు',
    body: 'ముఖ్యమైన వార్తలు వెంటనే మీ ఫోన్‌కు — స్పామ్ లేదు.',
    allow: 'అలర్ట్లు ఆన్ చేయండి',
    dismiss: 'ఇప్పుడు వద్దు',
    enabling: 'ఆన్ అవుతోంది…',
  },
  en: {
    title: 'Breaking news alerts',
    body: 'Get top stories instantly on your device — no spam.',
    allow: 'Turn on alerts',
    dismiss: 'Not now',
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
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const labels = POPUP_LABELS[popupLang()] || POPUP_LABELS.te

  const updatePosition = useCallback(() => {
    const anchor = document.querySelector('[data-push-anchor]')
    if (!anchor) {
      setPos({ top: 88, right: 16 })
      return
    }
    const rect = anchor.getBoundingClientRect()
    setPos({
      top: rect.bottom + 10,
      right: Math.max(12, window.innerWidth - rect.right),
    })
  }, [])

  useEffect(() => {
    if (!enabled || !isSupported || permission !== 'default') return
    if (isSubscribed !== false) return
    if (isPushDismissed('push_prompt_dismissed_at', DISMISS_DAYS)) return

    const timer = setTimeout(() => {
      updatePosition()
      setShowPopup(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }, POPUP_DELAY_MS)

    return () => clearTimeout(timer)
  }, [enabled, isSupported, isSubscribed, permission, updatePosition])

  useEffect(() => {
    if (!showPopup) return
    updatePosition()
    window.addEventListener('resize', updatePosition, { passive: true })
    window.addEventListener('scroll', updatePosition, { passive: true })
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [showPopup, updatePosition])

  const closePopup = useCallback(() => {
    setVisible(false)
    setTimeout(() => setShowPopup(false), 280)
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
      {showPopup && !isSubscribed && pos && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Enable notifications"
          className={`fixed z-[160] w-[min(calc(100vw-1.5rem),18rem)] transition-all duration-300 ease-out ${
            visible ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0 pointer-events-none'
          }`}
          style={{ top: pos.top, right: pos.right }}
        >
          {/* Arrow pointing to bell button */}
          <div
            className="absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-red-100 bg-white"
            style={{ right: 14 }}
            aria-hidden
          />
          <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-xl shadow-red-500/10 ring-1 ring-black/5">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                    <path d="M12 2a5 5 0 00-5 5v2.1c0 .5-.2 1-.5 1.4L4.6 13.2A1 1 0 005.5 15h13a1 1 0 00.9-1.5l-1.9-2.7c-.3-.4-.5-.9-.5-1.4V7a5 5 0 00-5-5zm0 20a2.5 2.5 0 01-2.45-2h4.9A2.5 2.5 0 0112 22z" />
                  </svg>
                </div>
                <p className="text-sm font-bold leading-tight text-white">{labels.title}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs leading-relaxed text-zinc-600">{labels.body}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void onAllow()}
                  disabled={isBusy}
                  className="flex-1 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50 sm:text-sm"
                >
                  {isBusy ? labels.enabling : labels.allow}
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="rounded-xl px-3 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 sm:text-sm"
                >
                  {labels.dismiss}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

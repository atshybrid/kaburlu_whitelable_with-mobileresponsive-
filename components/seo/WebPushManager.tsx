'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWebPush } from '@/hooks/useWebPush'
import { isPushDismissed, savePushDismiss } from '@/lib/push-utils'
import { PUSH_PROMPT_OPEN } from '@/lib/push-prompt'

const DISMISS_DAYS = 7
const AUTO_PROMPT_DELAY_MS = 6000

const LABELS: Record<
  string,
  {
    title: string
    subtitle: string
    b1: string
    b2: string
    b3: string
    cta: string
    dismiss: string
    enabling: string
    privacy: string
  }
> = {
  te: {
    title: 'బ్రేకింగ్ న్యూస్ మిస్ అవ్వకండి!',
    subtitle: 'ముఖ్యమైన వార్తలు వెంటనే మీ ఫోన్ / కంప్యూటర్‌కు వస్తాయి.',
    b1: 'బ్రేకింగ్ న్యూస్ తక్షణ అలర్ట్',
    b2: 'మీ రాష్ట్రం & దేశ వార్తలు',
    b3: 'స్పామ్ లేదు — ఎప్పుడైనా ఆఫ్ చేయవచ్చు',
    cta: 'అలర్ట్లు ఆన్ చేయండి',
    dismiss: 'ఇప్పుడు వద్దు',
    enabling: 'ఆన్ అవుతోంది…',
    privacy: 'మీ గోప్యతా మా ప్రాధాన్యత',
  },
  en: {
    title: "Don't miss breaking news!",
    subtitle: 'Get important stories instantly on your device.',
    b1: 'Instant breaking news alerts',
    b2: 'Local & national coverage',
    b3: 'No spam — turn off anytime',
    cta: 'Turn on alerts',
    dismiss: 'Not now',
    enabling: 'Enabling…',
    privacy: 'Your privacy matters to us',
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

  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const labels = LABELS[popupLang()] || LABELS.te

  const showModal = useCallback(() => {
    setOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  const closeModal = useCallback((saveDismiss = false) => {
    if (saveDismiss) savePushDismiss('push_prompt_dismissed_at')
    setVisible(false)
    setTimeout(() => setOpen(false), 300)
  }, [])

  // Auto-prompt after delay when push is off
  useEffect(() => {
    if (!enabled || !isSupported || permission === 'denied') return
    if (isSubscribed !== false) return
    if (isPushDismissed('push_prompt_dismissed_at', DISMISS_DAYS)) return

    const timer = setTimeout(showModal, AUTO_PROMPT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [enabled, isSupported, isSubscribed, permission, showModal])

  // Bell icon click opens modal
  useEffect(() => {
    const onOpen = () => {
      if (!enabled || !isSupported || permission === 'denied') return
      if (isSubscribed) return
      showModal()
    }
    window.addEventListener(PUSH_PROMPT_OPEN, onOpen)
    return () => window.removeEventListener(PUSH_PROMPT_OPEN, onOpen)
  }, [enabled, isSupported, permission, isSubscribed, showModal])

  // Lock body scroll when modal open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const onAllow = useCallback(async () => {
    const ok = await handleSubscribe()
    closeModal(false)
    if (!ok && Notification.permission !== 'granted') return
  }, [closeModal, handleSubscribe])

  if (!enabled || !isSupported || permission === 'denied') return null
  if (isSubscribed === null) return null

  if (!open || isSubscribed) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="presentation"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={() => closeModal(true)}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="push-prompt-title"
        className={`relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-6 pb-8 pt-8 text-center text-white">
          <button
            type="button"
            onClick={() => closeModal(true)}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="16" y2="16" /><line x1="16" y1="2" x2="2" y2="16" />
            </svg>
          </button>

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-600 shadow-md animate-[pulse_2s_ease-in-out_infinite]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8" aria-hidden>
                <path d="M12 2a5 5 0 00-5 5v2.1c0 .5-.2 1-.5 1.4L4.6 13.2A1 1 0 005.5 15h13a1 1 0 00.9-1.5l-1.9-2.7c-.3-.4-.5-.9-.5-1.4V7a5 5 0 00-5-5zm0 20a2.5 2.5 0 01-2.45-2h4.9A2.5 2.5 0 0112 22z" />
              </svg>
            </div>
          </div>

          <h2 id="push-prompt-title" className="text-xl font-black leading-tight">
            {labels.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{labels.subtitle}</p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5">
          <ul className="space-y-3">
            {[labels.b1, labels.b2, labels.b3].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-zinc-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden>
                    <polyline points="2 6 5 9 10 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => void onAllow()}
            disabled={isBusy}
            className="mt-6 w-full rounded-2xl bg-red-600 py-3.5 text-base font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
          >
            {isBusy ? labels.enabling : `🔔 ${labels.cta}`}
          </button>

          <button
            type="button"
            onClick={() => closeModal(true)}
            className="mt-3 w-full py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-600"
          >
            {labels.dismiss}
          </button>

          <p className="mt-4 text-center text-[10px] text-zinc-400">{labels.privacy}</p>
        </div>
      </div>
    </div>
  )
}

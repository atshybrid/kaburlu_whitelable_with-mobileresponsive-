'use client'

import { useWebPush } from '@/hooks/useWebPush'

const LABELS: Record<string, { subscribe: string; subscribed: string; enabling: string }> = {
  te: { subscribe: 'నోటిఫికేషన్లు', subscribed: 'ఆన్', enabling: 'ఆన్ అవుతోంది…' },
  en: { subscribe: 'Subscribe', subscribed: 'On', enabling: 'Enabling…' },
  hi: { subscribe: 'सूचनाएँ', subscribed: 'चालू', enabling: 'सक्षम…' },
  ta: { subscribe: 'அறிவிப்புகள்', subscribed: 'ஆன்', enabling: 'இயக்கம்…' },
  kn: { subscribe: 'ಅಧಿಸೂಚನೆಗಳು', subscribed: 'ಆನ್', enabling: 'ಸಕ್ರಿಯ…' },
}

function normalizeLang(lang?: string): string {
  const raw = String(lang || 'te').trim().toLowerCase()
  if (raw === 'telugu') return 'te'
  return raw.split('-')[0] || 'te'
}

export interface PushSubscribeButtonProps {
  enabled?: boolean
  vapidPublicKey?: string | null
  fcmSenderId?: string | null
  lang?: string
  compact?: boolean
  className?: string
}

export function PushSubscribeButton({
  enabled = false,
  vapidPublicKey,
  fcmSenderId,
  lang = 'te',
  compact = false,
  className = '',
}: PushSubscribeButtonProps) {
  const l = LABELS[normalizeLang(lang)] || LABELS.te
  const { isSupported, isSubscribed, isBusy, permission, handleSubscribe, handleUnsubscribe } =
    useWebPush({ enabled, vapidPublicKey, fcmSenderId })

  if (!enabled || !vapidPublicKey || !isSupported || permission === 'denied') return null
  if (isSubscribed === null) return null

  const base =
    'inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors disabled:opacity-50'
  const size = compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-1.5 text-xs sm:text-sm'

  if (isSubscribed) {
    return (
      <button
        type="button"
        onClick={() => void handleUnsubscribe()}
        disabled={isBusy}
        title="Notifications on — click to disable"
        aria-label="Disable push notifications"
        className={`${base} ${size} border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ${className}`}
      >
        <span aria-hidden>🔔</span>
        {!compact && <span>{l.subscribed}</span>}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => void handleSubscribe()}
      disabled={isBusy}
      title="Get breaking news alerts"
      aria-label="Subscribe to push notifications"
      className={`${base} ${size} border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 ${className}`}
    >
      <span aria-hidden>🔔</span>
      <span>{isBusy ? l.enabling : l.subscribe}</span>
    </button>
  )
}

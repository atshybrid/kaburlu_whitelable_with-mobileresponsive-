'use client'

import { useWebPush } from '@/hooks/useWebPush'

const LABELS: Record<string, {
  on: string
  off: string
  turnOn: string
  turnOff: string
  enabling: string
  disabling: string
  confirmOff: string
}> = {
  te: {
    on: 'ఆన్',
    off: 'ఆఫ్',
    turnOn: 'నోటిఫికేషన్లు ఆన్ చేయండి',
    turnOff: 'నోటిఫికేషన్లు ఆఫ్ చేయండి',
    enabling: 'ఆన్ అవుతోంది…',
    disabling: 'ఆఫ్ అవుతోంది…',
    confirmOff: 'నోటిఫికేషన్లు ఆఫ్ చేయాలా?',
  },
  en: {
    on: 'On',
    off: 'Off',
    turnOn: 'Turn on notifications',
    turnOff: 'Turn off notifications',
    enabling: 'Turning on…',
    disabling: 'Turning off…',
    confirmOff: 'Turn off notifications?',
  },
  hi: {
    on: 'चालू',
    off: 'बंद',
    turnOn: 'सूचनाएँ चालू करें',
    turnOff: 'सूचनाएँ बंद करें',
    enabling: 'चालू हो रहा…',
    disabling: 'बंद हो रहा…',
    confirmOff: 'सूचनाएँ बंद करें?',
  },
  ta: {
    on: 'ஆன்',
    off: 'ஆஃப்',
    turnOn: 'அறிவிப்புகளை ஆன் செய்யுங்கள்',
    turnOff: 'அறிவிப்புகளை ஆஃப் செய்யுங்கள்',
    enabling: 'இயக்கம்…',
    disabling: 'நிறுத்தம்…',
    confirmOff: 'அறிவிப்புகளை ஆஃப் செய்யவா?',
  },
  kn: {
    on: 'ಆನ್',
    off: 'ಆಫ್',
    turnOn: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ಆನ್ ಮಾಡಿ',
    turnOff: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ಆಫ್ ಮಾಡಿ',
    enabling: 'ಸಕ್ರಿಯ…',
    disabling: 'ನಿಷ್ಕ್ರಿಯ…',
    confirmOff: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ಆಫ್ ಮಾಡಬೇಕೇ?',
  },
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

  const onTurnOff = () => {
    if (!window.confirm(l.confirmOff)) return
    void handleUnsubscribe()
  }

  if (isSubscribed) {
    return (
      <button
        type="button"
        onClick={onTurnOff}
        disabled={isBusy}
        title={l.turnOff}
        aria-label={l.turnOff}
        aria-pressed="true"
        className={`${base} ${size} border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${className}`}
      >
        <span aria-hidden>🔔</span>
        <span>{isBusy ? l.disabling : l.on}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => void handleSubscribe()}
      disabled={isBusy}
      title={l.turnOn}
      aria-label={l.turnOn}
      aria-pressed="false"
      className={`${base} ${size} border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 ${className}`}
    >
      <span aria-hidden className="opacity-60">🔕</span>
      <span>{isBusy ? l.enabling : (compact ? l.off : l.turnOn)}</span>
    </button>
  )
}

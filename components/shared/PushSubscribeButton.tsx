'use client'

import { useWebPush } from '@/hooks/useWebPush'
import { openPushPrompt } from '@/lib/push-prompt'

const LABELS: Record<string, {
  on: string
  off: string
  alerts: string
  turnOn: string
  turnOff: string
  enabling: string
  disabling: string
  confirmOff: string
  live: string
}> = {
  te: {
    on: 'ఆన్',
    off: 'ఆఫ్',
    alerts: 'అలర్ట్లు',
    turnOn: 'బ్రేకింగ్ న్యూస్ అలర్ట్లు ఆన్ చేయండి',
    turnOff: 'అలర్ట్లు ఆఫ్ చేయండి',
    enabling: 'ఆన్ అవుతోంది…',
    disabling: 'ఆఫ్ అవుతోంది…',
    confirmOff: 'అలర్ట్లు ఆఫ్ చేయాలా?',
    live: 'లైవ్',
  },
  en: {
    on: 'On',
    off: 'Off',
    alerts: 'Alerts',
    turnOn: 'Turn on breaking news alerts',
    turnOff: 'Turn off alerts',
    enabling: 'Turning on…',
    disabling: 'Turning off…',
    confirmOff: 'Turn off notifications?',
    live: 'Live',
  },
  hi: {
    on: 'चालू',
    off: 'बंद',
    alerts: 'अलर्ट',
    turnOn: 'ब्रेकिंग न्यूज़ अलर्ट चालू करें',
    turnOff: 'अलर्ट बंद करें',
    enabling: 'चालू हो रहा…',
    disabling: 'बंद हो रहा…',
    confirmOff: 'सूचनाएँ बंद करें?',
    live: 'लाइव',
  },
  ta: {
    on: 'ஆன்',
    off: 'ஆஃப்',
    alerts: 'அலர்ட்',
    turnOn: 'அறிவிப்புகளை ஆன் செய்யுங்கள்',
    turnOff: 'அறிவிப்புகளை ஆஃப் செய்யுங்கள்',
    enabling: 'இயக்கம்…',
    disabling: 'நிறுத்தம்…',
    confirmOff: 'அறிவிப்புகளை ஆஃப் செய்யவா?',
    live: 'நேரடி',
  },
  kn: {
    on: 'ಆನ್',
    off: 'ಆಫ್',
    alerts: 'ಅಲರ್ಟ್',
    turnOn: 'ಬ್ರೇಕಿಂಗ್ ನ್ಯೂಸ್ ಅಲರ್ಟ್ ಆನ್ ಮಾಡಿ',
    turnOff: 'ಅಲರ್ಟ್ ಆಫ್ ಮಾಡಿ',
    enabling: 'ಸಕ್ರಿಯ…',
    disabling: 'ನಿಷ್ಕ್ರಿಯ…',
    confirmOff: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ಆಫ್ ಮಾಡಬೇಕೇ?',
    live: 'ಲೈವ್',
  },
}

function normalizeLang(lang?: string): string {
  const raw = String(lang || 'te').trim().toLowerCase()
  if (raw === 'telugu') return 'te'
  return raw.split('-')[0] || 'te'
}

function BellIcon({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={muted ? 'none' : 'currentColor'}
      stroke="currentColor"
      strokeWidth={muted ? 1.75 : 0}
      className={className}
      aria-hidden="true"
    >
      {muted ? (
        <>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <path d="M12 2a5 5 0 00-5 5v2.1c0 .5-.2 1-.5 1.4L4.6 13.2A1 1 0 005.5 15h13a1 1 0 00.9-1.5l-1.9-2.7c-.3-.4-.5-.9-.5-1.4V7a5 5 0 00-5-5zm0 20a2.5 2.5 0 01-2.45-2h4.9A2.5 2.5 0 0112 22z" />
      )}
    </svg>
  )
}

export interface PushSubscribeButtonProps {
  enabled?: boolean
  vapidPublicKey?: string | null
  fcmSenderId?: string | null
  lang?: string
  /** icon = header bell, chip = nav pill, card = mobile menu block */
  variant?: 'icon' | 'chip' | 'card'
  className?: string
  /** @deprecated use variant="chip" */
  compact?: boolean
}

export function PushSubscribeButton({
  enabled = false,
  vapidPublicKey,
  fcmSenderId,
  lang = 'te',
  variant,
  compact = false,
  className = '',
}: PushSubscribeButtonProps) {
  const resolvedVariant = variant || (compact ? 'icon' : 'chip')
  const l = LABELS[normalizeLang(lang)] || LABELS.te
  const { isSupported, isSubscribed, isBusy, permission, handleSubscribe, handleUnsubscribe } =
    useWebPush({ enabled, vapidPublicKey, fcmSenderId })

  if (!enabled || !vapidPublicKey || !isSupported || permission === 'denied') return null
  if (isSubscribed === null) return null

  const onTurnOff = () => {
    if (!window.confirm(l.confirmOff)) return
    void handleUnsubscribe()
  }

  const onTurnOn = () => openPushPrompt()

  if (resolvedVariant === 'card') {
    return (
      <div
        className={`rounded-2xl border p-4 ${
          isSubscribed
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
            : 'border-red-100 bg-gradient-to-br from-red-50/80 to-white'
        } ${className}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isSubscribed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}
          >
            <BellIcon className="h-5 w-5" muted={!isSubscribed} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-zinc-900">{l.alerts}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
              {isSubscribed ? l.turnOff : l.turnOn}
            </p>
          </div>
          {isSubscribed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {l.live}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={isSubscribed ? onTurnOff : onTurnOn}
          disabled={isBusy && isSubscribed}
          className={`mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 ${
            isSubscribed
              ? 'border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-400'
              : 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500'
          }`}
        >
          {isSubscribed ? (isBusy ? l.disabling : `${l.on} · ${l.turnOff}`) : `🔔 ${l.turnOn}`}
        </button>
      </div>
    )
  }

  if (resolvedVariant === 'icon') {
    return (
      <button
        type="button"
        onClick={isSubscribed ? onTurnOff : onTurnOn}
        disabled={isBusy}
        title={isSubscribed ? l.turnOff : l.turnOn}
        aria-label={isSubscribed ? l.turnOff : l.turnOn}
        aria-pressed={isSubscribed}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50 sm:h-10 sm:w-10 ${
          isSubscribed
            ? 'text-emerald-600 hover:bg-emerald-50'
            : 'text-zinc-400 hover:bg-red-50 hover:text-red-600'
        } ${className}`}
      >
        <BellIcon className="h-[18px] w-[18px]" muted={!isSubscribed} />
        {!isSubscribed && (
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
        )}
      </button>
    )
  }

  return null
}

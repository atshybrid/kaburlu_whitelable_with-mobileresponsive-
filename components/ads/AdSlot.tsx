import { AD_SLOTS, type AdSlotKey, type AdSlotType, getAdsSettings, getSlotConfig, resolveProvider } from '@/lib/ads'
import type { EffectiveSettings } from '@/lib/remote'
import { GoogleAdSenseUnitClient } from './GoogleAdSenseUnitClient'

// ── Fallback "house ad" shown when no ad provider is configured ───────────────
// Shown instead of returning null (blank space). Promotes the site or a CTA.
function FallbackAd({ type, label, className, style }: {
  type: AdSlotType
  label: string
  className?: string
  style?: React.CSSProperties
}) {
  const isSidebar = type === 'sidebar' || type === 'widget'
  const isInline  = type === 'inline'

  if (isSidebar) {
    return (
      <div
        className={`overflow-hidden rounded-xl ${className || ''}`.trim()}
        style={style}
        aria-label={label}
      >
        <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-red-600 to-orange-500 p-6 text-center text-white min-h-[200px] rounded-xl">
          <svg className="h-8 w-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-sm font-bold leading-snug">తాజా వార్తలు మిస్ అవ్వకండి!</p>
          <p className="text-xs opacity-90 leading-relaxed">నోటిఫికేషన్లు ఆన్ చేయండి &amp; అప్‌డేట్ అవుతూ ఉండండి</p>
          <span className="mt-1 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">సభ్యత్వం పొందండి →</span>
        </div>
      </div>
    )
  }

  // Banner / inline — horizontal layout
  const minH = isInline ? '90px' : '80px'
  return (
    <div
      className={`overflow-hidden rounded-xl ${className || ''}`.trim()}
      style={style}
      aria-label={label}
    >
      <div
        className="flex items-center justify-between gap-4 bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4 text-white"
        style={{ minHeight: minH }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg className="h-8 w-8 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">తాజా వార్తలు, అప్‌డేట్స్ అన్నీ మీ దగ్గర!</p>
            <p className="mt-0.5 text-xs opacity-90">రోజువారీ వార్తలు మీ ఇన్‌బాక్స్‌కి పొందండి</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold whitespace-nowrap backdrop-blur-sm">ఇప్పుడే చదవండి →</span>
      </div>
    </div>
  )
}

export function AdSlot({
  slot,
  settings,
  className,
  style,
}: {
  slot: AdSlotKey
  settings?: EffectiveSettings
  className?: string
  style?: React.CSSProperties
}) {
  const ads = getAdsSettings(settings)
  const def = AD_SLOTS[slot]
  const cfg = getSlotConfig(ads, slot)
  const provider = resolveProvider(ads, slot)
  const showHouseFallback = process.env.NEXT_PUBLIC_ADS_SHOW_HOUSE_FALLBACK === 'true'

  const label = (cfg.label || def.name || 'Advertisement').trim()

  if (provider === 'local') {
    const imageUrl = cfg.local?.imageUrl || ''
    const clickUrl = cfg.local?.clickUrl || '#'
    const alt = cfg.local?.alt || label

    return (
      <div className={className} style={style} aria-label={label}>
        {ads.debug ? (
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-400">
            {cfg.local?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cfg.local.logoUrl} alt="" className="h-4 w-4 rounded" />
            ) : null}
            <span>{slot}</span>
            <span>•</span>
            <span>LOCAL</span>
          </div>
        ) : null}

        <a href={clickUrl} target="_blank" rel="noreferrer" className="block overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
        </a>
      </div>
    )
  }

  if (provider === 'google') {
    const client = cfg.google?.client || ads.googleAdsense?.client || ''
    const slotId = cfg.google?.slot || ''
    const format = cfg.google?.format || 'auto'
    const layout = cfg.google?.layout
    const responsive = typeof cfg.google?.responsive === 'boolean' ? cfg.google.responsive : true

    // Incomplete Google config would render an empty box; fallback immediately.
    if (!client || !slotId) {
      if (showHouseFallback) {
        return <FallbackAd type={def.type} label={label} className={className} style={style} />
      }
      return null
    }

    return (
      <div className={className} style={style} aria-label={label}>
        {ads.debug ? (
          <div className="mb-2 text-[11px] uppercase tracking-wide text-zinc-400">
            {slot} • GOOGLE{layout ? ` [${layout}]` : ''}
          </div>
        ) : null}

        <GoogleAdSenseUnitClient
          client={client}
          slot={slotId}
          format={format}
          layout={layout}
          responsive={responsive}
          fallback={showHouseFallback ? <FallbackAd type={def.type} label={label} /> : null}
        />
      </div>
    )
  }

  if (ads.debug) {
    const primary = def.sizes[0]
    return (
      <div className={className} style={style} aria-label={label}>
        <div className="mb-2 text-[11px] uppercase tracking-wide text-zinc-400">
          {slot} • DISABLED
        </div>
        <div className="border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center" style={{ minHeight: primary ? `${primary.height}px` : '120px' }}>
          {def.name}
        </div>
      </div>
    )
  }

  // No ad provider configured → show branded fallback house-ad instead of blank space
  if (showHouseFallback) {
    return <FallbackAd type={def.type} label={label} className={className} style={style} />
  }
  return null
}

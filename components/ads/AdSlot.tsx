import { AD_SLOTS, type AdSlotKey, getAdsSettings, getSlotConfig, resolveProvider } from '@/lib/ads'
import type { EffectiveSettings } from '@/lib/remote'
import { GoogleAdSenseUnitClient } from './GoogleAdSenseUnitClient'

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
    const responsive = typeof cfg.google?.responsive === 'boolean' ? cfg.google.responsive : true

    return (
      <div className={className} style={style} aria-label={label}>
        {ads.debug ? (
          <div className="mb-2 text-[11px] uppercase tracking-wide text-zinc-400">
            {slot} • GOOGLE
          </div>
        ) : null}

        <GoogleAdSenseUnitClient client={client} slot={slotId} format={format} responsive={responsive} />
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

  return null
}

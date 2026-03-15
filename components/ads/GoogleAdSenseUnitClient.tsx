'use client'

import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export function GoogleAdSenseUnitClient({
  client,
  slot,
  format = 'auto',
  layout,
  responsive = true,
  className,
  style,
}: {
  client: string
  slot?: string   // optional — omit for auto-format responsive units
  format?: string
  layout?: string // 'in-article' for native in-article ads; omit for display/multiplex
  responsive?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch {
      // ignore
    }
  }, [client, slot])

  return (
    <>
      <Script
        id="adsense-script"
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
        crossOrigin="anonymous"
      />
      <ins
        className={(className || 'adsbygoogle').trim()}
        style={{ display: 'block', ...(style || {}) }}
        data-ad-client={client}
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </>
  )
}

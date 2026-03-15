'use client'

import Script from 'next/script'
import { useEffect, useRef, useState, type ReactNode } from 'react'

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
  fallback,
}: {
  client: string
  slot?: string   // optional — omit for auto-format responsive units
  format?: string
  layout?: string // 'in-article' for native in-article ads; omit for display/multiplex
  responsive?: boolean
  className?: string
  style?: React.CSSProperties
  fallback?: ReactNode
}) {
  const [noFill, setNoFill] = useState(false)
  const insRef = useRef<HTMLModElement | null>(null)

  useEffect(() => {
    setNoFill(false)
    let timer: ReturnType<typeof setTimeout> | null = null

    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})

      // Google may silently return no-fill; hide blank box and show fallback.
      timer = setTimeout(() => {
        const el = insRef.current
        if (!el) return
        const h = el.offsetHeight || 0
        const hasInner = (el.innerHTML || '').trim().length > 0
        if (h < 40 && !hasInner) {
          setNoFill(true)
        }
      }, 4500)
    } catch {
      setNoFill(true)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [client, slot, format, layout, responsive])

  if (noFill) {
    return <>{fallback ?? null}</>
  }

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
        ref={(el) => {
          insRef.current = el as HTMLModElement | null
        }}
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

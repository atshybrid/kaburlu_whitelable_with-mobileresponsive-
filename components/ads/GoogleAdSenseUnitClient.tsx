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
  const insRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setNoFill(false)
    let timer: ReturnType<typeof setTimeout> | null = null
    let observer: MutationObserver | null = null

    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})

      // Most reliable no-fill signal from AdSense.
      if (insRef.current) {
        observer = new MutationObserver(() => {
          const status = insRef.current?.getAttribute('data-ad-status')
          if (status === 'unfilled') setNoFill(true)
        })
        observer.observe(insRef.current, { attributes: true, attributeFilter: ['data-ad-status'] })
      }

      // Google may silently return no-fill; hide blank box and show fallback.
      // 12s timeout: AdSense script loads "afterInteractive" (~2-3s) + ad fill time (~1-2s).
      // Never hide if Google has already reported the slot as filled.
      timer = setTimeout(() => {
        const el = insRef.current
        if (!el) return
        const status = el.getAttribute('data-ad-status')
        if (status === 'filled') return         // already filled — never hide
        if (status === 'unfilled') {
          setNoFill(true)
          return
        }
        const h = el.offsetHeight || 0
        const hasInner = (el.innerHTML || '').trim().length > 0
        if (h < 40 && !hasInner) {
          setNoFill(true)
        }
      }, 12000)
    } catch {
      setNoFill(true)
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (observer) observer.disconnect()
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
        onLoad={() => {
          // Re-push after script loads to ensure the queued <ins> tags are processed
          try {
            window.adsbygoogle = window.adsbygoogle || []
            window.adsbygoogle.push({})
          } catch { /* ignore duplicate push */ }
        }}
      />
      <ins
        ref={(el) => {
          insRef.current = el as HTMLModElement | null
        }}
        className={(className || 'adsbygoogle').trim()}
        style={{ display: 'block', overflow: 'hidden', maxWidth: '100%', ...(style || {}) }}
        data-ad-client={client}
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(format !== 'autorelaxed' && format !== 'fluid' ? { 'data-full-width-responsive': responsive ? 'true' : 'false' } : {})}
      />
    </>
  )
}

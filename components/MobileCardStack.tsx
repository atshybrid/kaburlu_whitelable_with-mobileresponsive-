"use client"
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ShareCardButton from './ShareCardButton'
import { getAllArticles } from '../lib/data'

function truncateWords(text: string, n: number) {
  if (!text) return ''
  const clean = text.replace(/<[^>]*>/g, '')
  const words = clean.trim().split(/\s+/)
  if (words.length <= n) return clean
  return words.slice(0, n).join(' ') + '…'
}

export default function MobileCardStack() {
  const items = getAllArticles()
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
    const io = new IntersectionObserver(
      entries => {
        // mark the most visible entry as active
        let best: IntersectionObserverEntry | null = null
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e
        }
        if (best) {
          cards.forEach(c => c.classList.remove('is-active'))
          ;(best.target as HTMLElement).classList.add('is-active')
        }
      },
      { root: el, threshold: [0.3, 0.6, 0.9] }
    )
    cards.forEach(c => io.observe(c))
    return () => io.disconnect()
  }, [])

  const viewportMinusHeader = 'calc(100vh - 64px)'
  const imageHeight = '55%'

  return (
    <section className="md:hidden -mx-4 px-0" aria-label="Top stories">
      {/* Vertical snap container */}
      <div
        ref={listRef}
        className="overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{ height: viewportMinusHeader, WebkitOverflowScrolling: 'touch' as any }}
      >
        {items.map(a => {
          const snippet = truncateWords(a.summary || a.bodyHtml, 60)
          let captureEl: HTMLDivElement | null = null
          const setCapture = (el: HTMLDivElement | null) => {
            // ensure images attempt CORS to avoid canvas tainting
            if (el) {
              el.querySelectorAll('img').forEach(img => img.setAttribute('crossorigin','anonymous'))
            }
            captureEl = el
          }
          const url = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '') : '') + `/article/${a.slug}`
          return (
            <article
              key={a.id}
              data-card
              className="mobile-card relative snap-start"
              style={{ height: viewportMinusHeader }}
            >
              {/* Wrapper that we capture as an image */}
              <div ref={setCapture} className="h-full w-full">
                {/* Top photo */}
                <div style={{ height: imageHeight }} className="relative">
                  <img
                    src={a.hero || a.thumb || 'https://picsum.photos/seed/mobile/1200/1800'}
                    alt={a.title}
                    crossOrigin="anonymous"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                {/* Content panel */}
                <div className="mobile-card-content bg-white rounded-t-2xl -mt-4 relative z-10 px-4 pt-4 pb-5" style={{ height: `calc(100% - ${imageHeight})` }}>
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">{a.category.name}</span>
                    <span>•</span>
                    <time>{new Date(a.publishedAt).toLocaleDateString()}</time>
                    <span>•</span>
                    <span>{a.readTime}m</span>
                  </div>
                  <h2 className="mt-2 text-xl font-extrabold leading-tight">{a.title}</h2>
                  <p className="text-sm text-gray-700 mt-2">{snippet}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={a.reporter.avatar || 'https://i.pravatar.cc/48'} alt={a.reporter.name} crossOrigin="anonymous" className="w-6 h-6 rounded-full" />
                      <span className="text-xs text-gray-700">{a.reporter.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShareCardButton
                        title={a.title}
                        url={url}
                        getNode={() => captureEl}
                        className="px-3 py-1.5 text-sm rounded bg-white text-gray-900 border border-gray-200"
                      />
                      <Link href={`/article/${a.slug}`} className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded">
                        Read more
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

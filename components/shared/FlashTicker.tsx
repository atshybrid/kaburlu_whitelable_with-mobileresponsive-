"use client"
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { UrlObject } from 'url'
import type { Article } from '@/lib/data-sources'
import { articleHref } from '@/lib/url'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

export function FlashTicker({ tenantSlug, items, intervalMs = 5000 }: { tenantSlug: string; items: Article[]; intervalMs?: number }) {
  const list = useMemo(() => (Array.isArray(items) && items.length ? items : [{ id: 'na', title: 'No updates', slug: 'na' }]), [items])
  const [idx, setIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return // Don't rotate when paused
    
    const id = setInterval(() => {
      setPrevIdx(() => idx)
      setIdx((i) => (i + 1) % list.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [list.length, intervalMs, idx, isPaused])

  const current = list[idx]
  const previous = prevIdx !== null ? list[prevIdx] : null
  const currentHref = articleHref(tenantSlug, current.slug || current.id)
  
  const handlePrev = () => {
    setPrevIdx(idx)
    setIdx((i) => (i - 1 + list.length) % list.length)
  }
  
  const handleNext = () => {
    setPrevIdx(idx)
    setIdx((i) => (i + 1) % list.length)
  }

  return (
    <div 
      className="flex items-center gap-3 py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center rounded bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        Flashnews
      </div>
      
      {/* Manual controls */}
      <button
        onClick={handlePrev}
        className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Previous news"
      >
        <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div className="relative flex-1 overflow-hidden min-h-6 py-0.5">
        {previous && (
          <Link
            key={previous.id + '-' + prevIdx + '-out'}
            href={toHref(articleHref(tenantSlug, previous.slug || previous.id))}
            className="ticker-item animate-[ticker-out_400ms_ease-in_forwards] block truncate text-sm font-bold leading-6"
            aria-hidden="true"
            tabIndex={-1}
          >
            {previous.title}
          </Link>
        )}
        <Link
          key={current.id + '-' + idx + '-in'}
          href={toHref(currentHref)}
          className="ticker-item animate-[ticker-in_420ms_ease-out_forwards] block truncate text-sm font-bold leading-6 hover:text-red-600"
        >
          {current.title}
        </Link>
      </div>
      
      {/* Manual controls */}
      <button
        onClick={handleNext}
        className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Next news"
      >
        <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Progress indicator */}
      {list.length > 1 && (
        <div className="hidden sm:flex items-center gap-1">
          {list.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? 'w-6 bg-red-600' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

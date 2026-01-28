"use client"
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { UrlObject } from 'url'
import type { Article } from '@/lib/data-sources'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

/**
 * FlashTicker - Breaking news ticker with smooth animations
 * 
 * @param tenantSlug - Used if basePath is not provided (legacy)
 * @param basePath - Pre-computed base path from server to avoid hydration mismatch
 * @param items - Array of articles to display
 * @param intervalMs - Interval between items (default 5000ms)
 */
export function FlashTicker({ 
  tenantSlug, 
  basePath = '', 
  items, 
  intervalMs = 5000 
}: { 
  tenantSlug: string
  basePath?: string
  items: Article[]
  intervalMs?: number 
}) {
  const list = useMemo(() => (Array.isArray(items) && items.length ? items : [{ id: 'na', title: 'No updates', slug: 'na' }]), [items])
  const [idx, setIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Use basePath directly to construct article URLs (avoid hydration mismatch)
  const getArticleHref = (slug: string) => `${basePath}/article/${slug}`

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
  const currentHref = getArticleHref(current.slug || current.id)
  
  // ✅ Fixed: Track mounted state for animations only (not for conditional rendering)
  const [mounted, setMounted] = useState(false)
  
  // Set mounted on client after hydration completes
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div 
      className="flex items-center gap-2 sm:gap-3 py-2 sm:py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="flex items-center shrink-0 rounded bg-gradient-to-r from-red-600 to-red-500 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-white shadow-sm">
        <span className="hidden sm:inline">Flashnews</span>
        <span className="sm:hidden">🔴 తాజా</span>
      </div>
      
      {/* Manual controls - hidden */}
      {/* 
      <button
        onClick={handlePrev}
        className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Previous news"
      >
        <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      */}
      
      <div className="relative flex-1 overflow-hidden min-h-6 py-0.5">
        {/* Previous item - only show when mounted and animating */}
        {mounted && previous && (
          <Link
            key={previous.id + '-' + prevIdx + '-out'}
            href={toHref(getArticleHref(previous.slug || previous.id))}
            className="ticker-item animate-[ticker-out_400ms_ease-in_forwards] block truncate text-[13px] sm:text-sm font-bold leading-6"
            aria-hidden="true"
            tabIndex={-1}
          >
            {previous.title}
          </Link>
        )}
        {/* Current item - always render to avoid hydration mismatch */}
        <Link
          key={mounted ? current.id + '-' + idx + '-in' : 'initial'}
          href={toHref(currentHref)}
          className={`ticker-item block truncate text-[13px] sm:text-sm font-bold leading-6 hover:text-red-600 active:text-red-700 ${mounted ? 'animate-[ticker-in_420ms_ease-out_forwards]' : ''}`}
        >
          {current.title}
        </Link>
      </div>
      
      {/* Manual controls - hidden */}
      {/*
      <button
        onClick={handleNext}
        className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Next news"
      >
        <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      */}
      
      {/* Progress indicator - hidden */}
      {/*
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
      */}
    </div>
  )
}

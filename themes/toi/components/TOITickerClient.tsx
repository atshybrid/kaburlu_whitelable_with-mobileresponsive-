'use client'

import { useState, useEffect, useCallback } from 'react'
import { articleHref } from '@/lib/url'

interface TickerItem {
  id: string
  slug?: string
  title: string
}

export function TOITickerClient({ 
  tenantSlug, 
  items 
}: { 
  tenantSlug: string
  items: TickerItem[] 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextItem = useCallback(() => {
    if (items.length <= 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
      setIsAnimating(false)
    }, 300)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1) return
    const interval = setInterval(nextItem, 4000)
    return () => clearInterval(interval)
  }, [items.length, nextItem])

  if (items.length === 0) return null

  const currentItem = items[currentIndex]

  return (
    <div className="toi-ticker">
      <div className="toi-ticker-wrapper">
        <span className="toi-ticker-label">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            Breaking
          </span>
        </span>
        <div className="toi-ticker-content">
          <a
            href={articleHref(tenantSlug, currentItem.slug || currentItem.id)}
            className={`toi-ticker-item transition-all duration-300 ${
              isAnimating ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
            }`}
          >
            {currentItem.title}
          </a>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button 
            onClick={() => {
              setIsAnimating(true)
              setTimeout(() => {
                setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
                setIsAnimating(false)
              }, 300)
            }}
            className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white"
            aria-label="Previous"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button 
            onClick={nextItem}
            className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white"
            aria-label="Next"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

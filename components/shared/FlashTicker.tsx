"use client"
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { UrlObject } from 'url'
import type { Article } from '@/lib/data-sources'
import { articleHref } from '@/lib/url'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

export function FlashTicker({ tenantSlug, items, intervalMs = 3000 }: { tenantSlug: string; items: Article[]; intervalMs?: number }) {
  const list = useMemo(() => (Array.isArray(items) && items.length ? items : [{ id: 'na', title: 'No updates', slug: 'na' }]), [items])
  const [idx, setIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setPrevIdx(() => idx)
      setIdx((i) => (i + 1) % list.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [list.length, intervalMs, idx])

  const current = list[idx]
  const previous = prevIdx !== null ? list[prevIdx] : null
  const currentHref = articleHref(tenantSlug, current.slug || current.id)

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center rounded bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Flashnews</div>
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
    </div>
  )
}

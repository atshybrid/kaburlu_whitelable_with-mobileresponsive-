"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Article } from '@/lib/data-sources'
import { articleHref } from '@/lib/url'
import { PlaceholderImg } from './PlaceholderImg'

export function AdjustableList({
  tenantSlug,
  title,
  href,
  items,
  max,
  leftColumnSelector = '#left-col',
}: {
  tenantSlug: string
  title: string
  href?: string
  items: Article[]
  max?: number // cap, default 8
  leftColumnSelector?: string
}) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const rowsContainerRef = useRef<HTMLDivElement | null>(null)
  const [count, setCount] = useState<number>(() => Math.min(max || 8, items.length))

  const limited = useMemo(() => items.slice(0, Math.min(count, items.length)), [items, count])

  useEffect(() => {
    let raf = 0
    try {
      const left = document.querySelector(leftColumnSelector) as HTMLElement | null
      if (!left) return
      const leftHeight = left.getBoundingClientRect().height
      const headerH = headerRef.current?.getBoundingClientRect().height || 0
      const firstRow = rowsContainerRef.current?.querySelector('[data-row]') as HTMLElement | null
      const rowH = firstRow?.getBoundingClientRect().height || 60

      const opt7 = Math.min(7, items.length)
      const opt8 = Math.min(8, items.length)
      const total7 = headerH + rowH * opt7
      const total8 = headerH + rowH * opt8
      const diff7 = Math.abs(leftHeight - total7)
      const diff8 = Math.abs(leftHeight - total8)

      let chosen = diff8 < diff7 ? opt8 : opt7
      if (total8 - leftHeight > 40) chosen = opt7

      if (chosen !== count) {
        raf = window.requestAnimationFrame(() => setCount(chosen))
      }
    } catch {
      // ignore measurement errors
    }
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [items, count, leftColumnSelector])

  return (
    <section className="mb-8 rounded-xl bg-white">
      <div ref={headerRef}>
        {href ? (
          <a
            href={href}
            className="block border-b bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:opacity-90"
          >
            {title}
          </a>
        ) : (
          <div className="border-b bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
            {title}
          </div>
        )}
      </div>
      <div ref={rowsContainerRef}>
        {limited.map((a) => (
          <div
            key={a.id}
            data-row
            className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-3 border-b border-dashed border-zinc-200 last:border-b-0"
          >
            <a
              href={articleHref(tenantSlug, a.slug || a.id)}
              className="line-clamp-2 text-sm font-semibold leading-tight hover:text-red-600"
            >
              {a.title}
            </a>
            <div className="h-16 w-24 overflow-hidden rounded">
              {a.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
              ) : (
                <PlaceholderImg className="h-full w-full object-cover" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

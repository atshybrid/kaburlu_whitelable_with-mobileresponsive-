"use client"
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ExternalLink from './ExternalLink'
import type { NormalizedShortArticle } from '../lib/api'

function safeTime(iso?: string | null) {
  if (!iso) return ''
  const t = String(iso)
  const [d, rest] = t.split('T')
  const time = (rest || '').slice(0,5)
  return `${d} ${time}`
}

export default function AutoThumbList({ items, minCount = 1, maxCount }: { items: NormalizedShortArticle[]; minCount?: number; maxCount?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLLIElement>(null)
  const [count, setCount] = useState<number>(minCount)

  useEffect(() => {
    const update = () => {
      const el = containerRef.current
      const probe = probeRef.current
      if (!el || !probe) return
  const buffer = 2
      const containerH = Math.max(0, el.clientHeight - buffer)
      const itemH = probe.offsetHeight || 64
  const possible = Math.floor(containerH / itemH)
  const capPossible = typeof maxCount === 'number' ? Math.min(possible, maxCount) : possible
  const desired = Math.min(items.length, capPossible)
  // never exceed possible so we don't overlap the More button
  setCount(Math.min(Math.max(minCount, desired), possible))
    }
    const ro = new ResizeObserver(() => update())
    if (containerRef.current) ro.observe(containerRef.current)
    const id = requestAnimationFrame(update)
    return () => { ro.disconnect(); cancelAnimationFrame(id) }
  }, [items.length, minCount, maxCount])

  const slice = items.slice(0, count)

  return (
    <div ref={containerRef} className="h-full px-3">
      {items[0] && (
        <ul className="invisible absolute -z-10 divide-y divide-dashed divide-gray-200">
          <li ref={probeRef} className="py-1">
            <div className="flex items-center gap-2">
              <div className="relative w-16 aspect-[4/3] rounded-md overflow-hidden ring-1 ring-gray-200 shrink-0">
                <div className="w-full h-full bg-gray-200" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] leading-snug font-bold text-gray-900 line-clamp-2">{items[0].title}</div>
                <div className="text-[12px] leading-snug text-gray-600 line-clamp-2 mt-0.5">{items[0].summary || ''}</div>
                <div className="text-[11px] leading-snug text-gray-500 mt-0.5">{safeTime(items[0].publishedAt)}</div>
              </div>
            </div>
          </li>
        </ul>
      )}
      <ul className="divide-y divide-dashed divide-gray-200 h-full">
        {slice.map(a => (
          <li key={a.id} className="py-1">
            <ExternalLink href={a.href} className="group flex items-center gap-2">
              <div className="relative w-16 aspect-[4/3] rounded-md overflow-hidden ring-1 ring-gray-200 shrink-0">
                {a.image ? <Image src={a.image} alt={a.alt || a.title} fill sizes="64px" className="object-cover" /> : <div className="w-full h-full bg-gray-200" />}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] leading-snug font-bold text-gray-900 group-hover:text-[#255db1] line-clamp-2">{a.title}</div>
                {a.summary && (
                  <div className="text-[12px] leading-snug text-gray-600 line-clamp-2 mt-0.5">{a.summary}</div>
                )}
                {a.publishedAt && (
                  <div className="text-[11px] leading-snug text-gray-500 mt-0.5">{safeTime(a.publishedAt)}</div>
                )}
              </div>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

"use client"
import { useEffect, useRef, useState } from 'react'
import ExternalLink from './ExternalLink'
import type { NormalizedShortArticle } from '../lib/api'

type Props = {
  items: NormalizedShortArticle[]
  minCount?: number
  maxCount?: number
  // Optional dynamic caps: when titles wrap to 2 lines, use twoLineCap, otherwise singleLineCap
  singleLineCap?: number
  twoLineCap?: number
}

export default function AutoBulletList({ items, minCount = 1, maxCount, singleLineCap, twoLineCap }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLLIElement>(null)
  const [count, setCount] = useState<number>(minCount)

  useEffect(() => {
    const update = () => {
      const el = containerRef.current
      const probe = probeRef.current
      if (!el || !probe) return
      // Reserve a tiny safety buffer to avoid last-item bleed under the More button
      const buffer = 4
      const containerH = Math.max(0, el.clientHeight - buffer)
      const itemH = probe.offsetHeight || 24

      // Determine dynamic cap by estimating title line count in the probe
      let dynamicMax = typeof maxCount === 'number' ? maxCount : undefined
      if (singleLineCap || twoLineCap) {
        const titleEl = probe.querySelector<HTMLElement>('.js-title')
        if (titleEl) {
          const style = getComputedStyle(titleEl)
          const lh = parseFloat(style.lineHeight || '0') || 0
          const h = titleEl.getBoundingClientRect().height
          const lines = lh > 0 ? Math.round(h / lh) : 1
          if (lines >= 2 && typeof twoLineCap === 'number') {
            dynamicMax = dynamicMax === undefined ? twoLineCap : Math.min(dynamicMax, twoLineCap)
          } else if (typeof singleLineCap === 'number') {
            dynamicMax = dynamicMax === undefined ? singleLineCap : Math.min(dynamicMax, singleLineCap)
          }
        }
      }

  const possible = Math.floor(containerH / itemH)
  const capPossible = typeof dynamicMax === 'number' ? Math.min(possible, dynamicMax) : possible
  const desired = Math.min(items.length, capPossible)
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
        <ul className="invisible absolute -z-10">
          <li ref={probeRef} className="py-1.5">
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-start gap-2 min-w-0">
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-gray-700 shrink-0" />
                <span className="js-title text-[15px] leading-relaxed hover:text-indigo-700 line-clamp-2">{items[0].title}</span>
              </span>
              <span aria-hidden className="ml-2 pr-1 text-[#255db1] shrink-0">›</span>
            </div>
          </li>
        </ul>
      )}
      <ul className="divide-y divide-dashed divide-gray-200 h-full">
        {slice.map(a => (
          <li key={a.id} className="py-1.5">
            <ExternalLink href={a.href} className="flex items-start justify-between gap-2">
              <span className="flex items-start gap-2 min-w-0">
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-gray-700 shrink-0" />
                <span className="js-title text-[15px] leading-relaxed hover:text-indigo-700 line-clamp-2">{a.title}</span>
              </span>
              <span aria-hidden className="ml-2 pr-1 text-[#255db1] shrink-0">›</span>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

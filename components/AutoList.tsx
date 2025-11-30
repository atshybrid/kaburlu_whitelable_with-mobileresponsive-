"use client"
import { useEffect, useRef, useState } from 'react'

type Props<T> = {
  items: T[]
  renderItem: (item: T, idx: number) => React.ReactNode
  className?: string
  minCount?: number
  maxCount?: number
}

export default function AutoList<T>({ items, renderItem, className, minCount = 1, maxCount }: Props<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLLIElement>(null)
  const [count, setCount] = useState<number>(minCount)

  useEffect(() => {
    const update = () => {
      const el = containerRef.current
      const probe = probeRef.current
      if (!el || !probe) return
      const containerH = el.clientHeight
      const itemH = probe.offsetHeight || 24
      const possible = Math.max(minCount, Math.floor(containerH / itemH))
      const cap = typeof maxCount === 'number' ? Math.min(possible, maxCount) : possible
      setCount(Math.max(minCount, Math.min(cap, items.length)))
    }
    const ro = new ResizeObserver(() => update())
    if (containerRef.current) ro.observe(containerRef.current)
    // Initial measure after first paint
    const id = requestAnimationFrame(update)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(id)
    }
  }, [items.length, minCount, maxCount])

  const slice = items.slice(0, count)

  return (
    <div ref={containerRef} className={className}>
      {/* probe for measuring item height */}
      {items[0] && (
        <ul className="invisible absolute -z-10">
          <li ref={probeRef}>{renderItem(items[0], 0)}</li>
        </ul>
      )}
      <ul className="divide-y divide-gray-200">
        {slice.map((it, i) => (
          <li key={(it as any).id ?? i} className="py-1.5">
            {renderItem(it, i)}
          </li>
        ))}
      </ul>
    </div>
  )
}

"use client"

import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import SectionBar from './SectionBar'
import ExternalLink from './ExternalLink'
import AutoBulletList from './AutoBulletList'
import AutoThumbList from './AutoThumbList'
import type { NormalizedShortArticle } from '../lib/api'

function HeroImageCard({ a }: { a: NormalizedShortArticle }) {
  const title = a.title
  const href = a.href
  const image = a.image || ''
  return (
    <div className="relative rounded overflow-hidden">
      <div className="relative aspect-[16/9]">
        {image ? (
          <Image src={image} alt={a.alt || title} fill className="object-cover" sizes="(min-width:768px) 50vw, 100vw" />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
        <p className="text-xs opacity-90">{a.category || 'News'}</p>
        <h2 className="text-2xl font-extrabold leading-tight"><ExternalLink href={href}>{title}</ExternalLink></h2>
      </div>
    </div>
  )
}

function BulletList({ items }: { items: NormalizedShortArticle[] }) {
  return (
    <div className="px-3">
      <ul className="divide-y divide-dashed divide-gray-200">
        {items.map((a) => (
          <li key={a.id} className="py-2">
            <ExternalLink href={a.href} className="flex items-start justify-between gap-2">
              <span className="flex items-start gap-2 min-w-0">
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-gray-700 shrink-0" />
                <span className="text-[15px] leading-relaxed hover:text-indigo-700 line-clamp-2">{a.title}</span>
              </span>
              <span aria-hidden className="ml-2 pr-2 text-[#255db1] shrink-0">›</span>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function HeroDailyClient({
  catName,
  leftTop,
  leftBottom,
  center,
  right,
}: {
  catName: string
  leftTop: NormalizedShortArticle[]
  leftBottom: NormalizedShortArticle[]
  center: NormalizedShortArticle[]
  right: NormalizedShortArticle[]
}) {
  const leftRef = useRef<HTMLDivElement | null>(null)
  const [leftHeight, setLeftHeight] = useState<number | null>(null)

  useEffect(() => {
    if (!leftRef.current) return
    const el = leftRef.current
    const ro = new ResizeObserver(entries => {
      const h = entries[0]?.contentRect.height
      if (typeof h === 'number') setLeftHeight(h)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const colStyle = leftHeight ? { height: `${leftHeight}px` } as React.CSSProperties : undefined

  return (
    <section className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
        {/* Left column (stacked) */}
        <div ref={leftRef} className="flex flex-col">
          <SectionBar title={catName} />
          {leftTop[0] && (
            <div className="mt-2">
              <HeroImageCard a={leftTop[0]} />
            </div>
          )}
          <SectionBar title={catName} compact className="mt-2" />
          <div className="mt-2 rounded border bg-white/70 dark:bg-gray-900/40 overflow-hidden flex flex-col">
            <div>
              <BulletList items={leftBottom.slice(0, 2)} />
            </div>
            <div className="p-3 flex justify-center">
              <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-1.5 border border-gray-300">More »</a>
            </div>
          </div>
        </div>

        {/* Center column (height matches left; list trims to fit) */}
        <div className="h-full flex flex-col" style={colStyle}>
          <SectionBar title={catName} compact />
          <div className="mt-2 rounded border bg-white/70 dark:bg-gray-900/40 overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              <AutoBulletList items={center} minCount={1} maxCount={30} singleLineCap={8} twoLineCap={6} />
            </div>
            <div className="p-3 flex justify-center">
              <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-1.5 border border-gray-300">More »</a>
            </div>
          </div>
        </div>

        {/* Right column (height matches left; thumbs trim to fit) */}
        <div className="h-full flex flex-col" style={colStyle}>
          <SectionBar title={catName} compact />
          <div className="mt-2 rounded border bg-white/70 dark:bg-gray-900/40 overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              <AutoThumbList items={right} minCount={5} maxCount={6} />
            </div>
            <div className="p-3 flex justify-center">
              <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-1.5 border border-gray-300">More »</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

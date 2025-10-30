"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { getAllArticles, getMostRead, getTopHeadlines } from '../lib/data'
import type { Article } from '../lib/types'
import AdBanner from './AdBanner'

function OverlayTitle({a}:{a:Article}){
  return (
    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/75 via-black/40 to-transparent text-white">
      <div className="text-xs uppercase tracking-wide opacity-90">
        <Link href={`/category/${a.category.slug}`} className="hover:underline">{a.category.name}</Link>
      </div>
      <h2 className="mt-1 text-lg md:text-2xl font-bold clamp-3">
        <Link href={`/article/${a.slug}`}>{a.title}</Link>
      </h2>
    </div>
  )
}

export default function HeroComposite(){
  const top = getTopHeadlines(5)
  const latest = getAllArticles().slice(0,8)
  const mostRead = getMostRead(6)

  // autoplay carousel on the left
  const [idx,setIdx] = useState(0)
  const active = useMemo(()=> top[idx%top.length], [idx, top])
  useEffect(()=>{
    const t = setInterval(()=> setIdx(i=> (i+1)%top.length), 4500)
    return ()=> clearInterval(t)
  },[top.length])

  return (
    <section className="max-w-[var(--site-max)] mx-auto px-4 mt-4">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {/* Left: big hero spanning 2 columns with fixed desktop height for equal rows */}
        <div className="relative rounded overflow-hidden aspect-[16/10] md:col-span-2 md:h-[420px]">
          <Image src={active.hero} alt={active.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" priority />
          <OverlayTitle a={active} />
        </div>

        {/* Middle columns: two lists with 1:1 thumbs (left thumb, right title) */}
        {Array.from({length:2}).map((_,i)=>{
          const start = i*4
          const part = latest.slice(start, start+4)
          return (
            <div key={i} className="flex flex-col gap-3 md:h-[420px]">
              <div className="text-xs text-gray-500">Latest</div>
              <ul className="flex-1 overflow-hidden">
                {part.map(a => (
                  <li key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                    <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded">
                      <Image src={a.thumb} alt="" fill className="object-cover" sizes="96px" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/category/${a.category.slug}`} className="text-[11px] uppercase tracking-wide text-indigo-700 dark:text-indigo-300">{a.category.name}</Link>
                      <Link href={`/article/${a.slug}`} className="block text-[15px] leading-snug clamp-2 hover:text-indigo-600">
                        {a.title}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {/* Right: ad + most read list, constrained to equal height */}
        <div className="md:h-[420px] flex flex-col gap-4">
          <AdBanner height={160} />
          <div className="border-t border-gray-200 dark:border-gray-800 pt-3 overflow-hidden">
            <h4 className="text-sm font-bold mb-2">Most Read</h4>
            <ul className="flex flex-col gap-3">
              {mostRead.slice(0,5).map(a => (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="relative w-20 h-16 shrink-0 overflow-hidden rounded">
                    <Image src={a.thumb} alt="" fill className="object-cover" sizes="120px" />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/category/${a.category.slug}`} className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{a.category.name}</Link>
                    <Link href={`/article/${a.slug}`} className="block text-[15px] clamp-3 leading-snug hover:text-indigo-600">
                      {a.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

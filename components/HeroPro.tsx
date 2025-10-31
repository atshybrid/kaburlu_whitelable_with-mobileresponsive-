"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { getAllArticles } from '../lib/data'
import type { Article } from '../lib/types'
import AdBanner from './AdBanner'

function Overlay({ a }: { a: Article }) {
  return (
    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/75 via-black/40 to-transparent text-white">
      <div className="text-[11px] uppercase tracking-wide opacity-90">
        <Link href={`/category/${a.category.slug}`} className="hover:underline">{a.category.name}</Link>
      </div>
      <h2 className="mt-1 text-lg md:text-2xl font-bold clamp-3">
        <Link href={`/article/${a.slug}`}>{a.title}</Link>
      </h2>
    </div>
  )
}

function SmallTile({ a }: { a: Article }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded">
        <Image src={a.thumb||a.hero||''} alt="" fill className="object-cover" sizes="96px" />
      </div>
      <div className="min-w-0">
        <Link href={`/article/${a.slug}`} className="block text-[15px] leading-snug clamp-2 hover:text-indigo-600">
          {a.title}
        </Link>
      </div>
    </li>
  )
}

function CenterRow({ a }: { a: Article }){
  return (
    <li className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <div className="min-w-0 flex-1">
        <Link href={`/category/${a.category.slug}`} className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{a.category.name}</Link>
        <Link href={`/article/${a.slug}`} className="block text-[16px] leading-snug clamp-2 hover:text-indigo-600">{a.title}</Link>
      </div>
      <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded">
        <Image src={a.thumb||a.hero||''} alt="" fill className="object-cover" sizes="96px" />
      </div>
    </li>
  )
}

function RightRow({ a }: { a: Article }){
  return (
    <li className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <Link href={`/article/${a.slug}`} className="block text-[15px] font-semibold clamp-2 leading-snug hover:text-indigo-600">{a.title}</Link>
      <p className="mt-1 text-[13px] text-gray-600 dark:text-gray-300 leading-snug line-clamp-2">{a.summary}</p>
    </li>
  )
}

function SubHeader({title}:{title:string}){
  return (
    <div className="px-3 py-2 rounded-t bg-gradient-to-r from-gray-900/90 via-gray-800/80 to-gray-700/70 text-white text-xs font-semibold tracking-wide">
      {title}
    </div>
  )
}

export default function HeroPro(){
  const latest10 = getAllArticles().slice(0,10)
  const center8 = getAllArticles().slice(0,8)

  // Left big hero auto-rotate
  const [idx, setIdx] = useState(0)
  const active = useMemo(()=> latest10[idx % latest10.length], [idx, latest10])
  useEffect(()=>{
    const t = setInterval(()=> setIdx(i => (i + 1) % latest10.length), 4500)
    return ()=> clearInterval(t)
  }, [latest10.length])

  return (
    <section aria-label="Hero Composite" className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {/* Left column */}
        <div aria-label="Hero Left" className="flex flex-col gap-3 md:gap-4">
          {/* Top big hero (16:9), capped height for tighter UI */}
          <div className="relative rounded overflow-hidden aspect-[16/9] md:max-h-[360px]">
            <Image src={active.hero||active.thumb||''} alt={active.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" priority />
            <Overlay a={active} />
          </div>
          {/* Bottom compact list (equal height box) */}
          <div className="rounded border border-gray-100 dark:border-gray-800 overflow-hidden">
            <SubHeader title="More Headlines" />
            <div className="p-3 h-[240px] bg-white/60 dark:bg-gray-900/40 backdrop-blur">
              <ul className="grid grid-cols-1 gap-2">
                {latest10.slice(1,4).map(a => <SmallTile key={a.id} a={a} />)}
              </ul>
            </div>
          </div>
        </div>

        {/* Center column */}
        <div aria-label="Hero Center" className="flex flex-col">
          <div className="rounded border border-gray-100 dark:border-gray-800 overflow-hidden">
            <SubHeader title="Featured" />
            <div className="p-3 h-[240px] bg-white/60 dark:bg-gray-900/40 backdrop-blur">
              {/* Card-style compact items (no scroll) */}
              <ul className="grid grid-cols-1 gap-2">
                {center8.slice(0,3).map(a => (
                  <li key={a.id} className="rounded border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-800/40 p-2 flex items-center gap-3">
                    <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded">
                      <Image src={a.thumb||a.hero||''} alt="" fill className="object-cover" sizes="72px" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/category/${a.category.slug}`} className="text-[11px] uppercase tracking-wide text-indigo-700 dark:text-indigo-300">{a.category.name}</Link>
                      <Link href={`/article/${a.slug}`} className="block text-[15px] leading-snug clamp-2 hover:text-indigo-600">{a.title}</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div aria-label="Hero Right" className="flex flex-col gap-4">
          {/* Top ads */}
          <div><AdBanner height={140} /></div>
          {/* Bottom article list with title+summary (equal height, no scroll) */}
          <div className="rounded border border-gray-100 dark:border-gray-800 overflow-hidden">
            <SubHeader title="Quick Reads" />
            <div className="p-3 h-[240px] bg-white/60 dark:bg-gray-900/40 backdrop-blur">
              <ul className="grid grid-cols-1 gap-2">
                {latest10.slice(0,2).map(a => (
                  <li key={a.id} className="rounded border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-800/40 p-3">
                    <Link href={`/article/${a.slug}`} className="block text-[15px] font-semibold clamp-2 leading-snug hover:text-indigo-600">{a.title}</Link>
                    <p className="mt-1 text-[13px] text-gray-600 dark:text-gray-300 leading-snug line-clamp-2">{a.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

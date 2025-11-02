"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { getAllArticles } from '../lib/data'
import type { Article } from '../lib/types'

function SectionTitle({children}:{children:React.ReactNode}){
  return (
    <div className="inline-block bg-[#255db1] text-white text-sm font-bold px-3 py-1 rounded">{children}</div>
  )
}

function LeftSlider({items}:{items:Article[]}){
  const [i,setI] = useState(0)
  const a = items[i % items.length]
  return (
    <div className="relative rounded overflow-hidden">
      <div className="relative aspect-[16/9]">
        <Image src={a.hero||a.thumb||''} alt={a.title} fill className="object-cover" sizes="(min-width:768px) 50vw, 100vw" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
        <p className="text-xs opacity-90">{a.category.name}</p>
        <h2 className="text-2xl font-extrabold leading-tight"><Link href={`/article/${a.slug}`}>{a.title}</Link></h2>
      </div>
      {/* arrows */}
      <button aria-label="Prev" onClick={()=>setI(n=> (n-1+items.length)%items.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white grid place-items-center">‹</button>
      <button aria-label="Next" onClick={()=>setI(n=> (n+1)%items.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white grid place-items-center">›</button>
    </div>
  )
}

function BulletList({items}:{items:Article[]}){
  return (
    <ul className="divide-y divide-gray-200">
      {items.map(a=> (
        <li key={a.id} className="py-2">
          <Link href={`/article/${a.slug}`} className="flex items-start gap-2">
            <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-gray-700" />
            <span className="text-[15px] leading-snug hover:text-indigo-700">{a.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function ThumbRow({a}:{a:Article}){
  return (
    <li className="py-2 border-b last:border-b-0">
      <Link href={`/article/${a.slug}`} className="flex items-center gap-3">
        <div className="relative w-28 aspect-[4/3] rounded overflow-hidden shrink-0">
          <Image src={a.thumb||a.hero||''} alt={a.title} fill sizes="112px" className="object-cover" />
        </div>
        <span className="text-[14px] leading-snug hover:text-indigo-700">{a.title}</span>
      </Link>
    </li>
  )
}

export default function HeroDaily(){
  const all = useMemo(()=> getAllArticles(), [])
  const left = all.slice(0,5)
  const center = all.slice(0,7)
  const rightTop = all.slice(0,4)
  const rightBottom = all.slice(4,8)

  return (
    <section className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* left slider */}
        <div className="md:col-span-5">
          <SectionTitle>టాప్ స్టోరీస్</SectionTitle>
          <div className="mt-2">
            <LeftSlider items={left} />
          </div>
        </div>

        {/* center bullet list */}
        <div className="md:col-span-4">
          <SectionTitle>తాజా వార్తలు</SectionTitle>
          <div className="mt-2 rounded border bg-white/70 dark:bg-gray-900/40">
            <BulletList items={center} />
            <div className="p-3 flex justify-center">
              <Link href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-[#255db1] border border-[#255db1]/40 rounded-full px-4 py-1.5">More »</Link>
            </div>
          </div>
        </div>

        {/* right thumbnails + filter (two stacked rows) */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between">
            <SectionTitle>జిల్లా వార్తలు</SectionTitle>
            <select className="ml-3 border rounded text-sm px-2 py-1">
              <option>Select District</option>
              <option>Hyderabad</option>
              <option>Vijayawada</option>
              <option>Visakhapatnam</option>
            </select>
          </div>
          <div className="mt-2 rounded border bg-white/70 dark:bg-gray-900/40">
            <ul>
              {rightTop.map(a => <ThumbRow key={a.id} a={a} />)}
            </ul>
            <div className="p-3 flex justify-center">
              <Link href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-[#255db1] border border-[#255db1]/40 rounded-full px-4 py-1.5">More »</Link>
            </div>
          </div>
          <div className="mt-4">
            <SectionTitle>ట్రెండింగ్</SectionTitle>
            <div className="mt-2 rounded border bg-white/70 dark:bg-gray-900/40">
              <ul>
                {rightBottom.map(a => <ThumbRow key={a.id} a={a} />)}
              </ul>
              <div className="p-3 flex justify-center">
                <Link href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-[#255db1] border border-[#255db1]/40 rounded-full px-4 py-1.5">More »</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

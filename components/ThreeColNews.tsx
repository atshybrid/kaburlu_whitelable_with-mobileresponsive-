"use client"
import Image from 'next/image'
import Link from 'next/link'
import { getArticlesByCategory, getCategories } from '../lib/data'
import { getBelowHeroConfig } from '../lib/uiConfig'
import { chunk } from '../lib/ui'

function SectionTitle({children}:{children:React.ReactNode}){
  return (
    <div className="inline-block bg-[#255db1] text-white text-sm font-bold px-3 py-1 rounded">{children}</div>
  )
}

function Column({ slug, title, listCount }: { slug: string, title: string, listCount: number }){
  const items = getArticlesByCategory(slug)
  if (!items.length) return null
  const [top, ...rest] = items
  const list = rest.slice(0, listCount)
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-2 rounded border bg-white/70 dark:bg-gray-900/40 overflow-hidden">
        {/* top image card */}
        <div className="p-3">
          <div className="relative w-full aspect-[4/3] rounded overflow-hidden">
            <Image src={top.thumb||top.hero||''} alt={top.title} fill className="object-cover" sizes="(min-width:768px) 25vw, 90vw" />
          </div>
          <Link href={`/article/${top.slug}`} className="mt-2 block text-[16px] font-semibold hover:text-indigo-700 line-clamp-2">{top.title}</Link>
        </div>
        {/* bullets */}
        <ul className="px-3 pb-2 divide-y divide-dotted divide-gray-300">
          {list.map(a => (
            <li key={a.id} className="py-2">
              <Link href={`/article/${a.slug}`} className="flex items-start gap-2">
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-gray-700" />
                <span className="text-[15px] leading-snug hover:text-indigo-700 line-clamp-2">{a.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-3 flex justify-center">
          <Link href={`/category/${slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#255db1] border border-[#255db1]/40 rounded-full px-4 py-1.5">More »</Link>
        </div>
      </div>
    </div>
  )
}

export default function ThreeColNews(){
  // Build list of categories to cover rows*3; cycle over config.categories or derive from data.
  const allCats = getCategories().filter(c=> c.slug !== 'top' && c.slug !== 'latest')
  const cfg = getBelowHeroConfig()
  const order = cfg.categories.length ? cfg.categories : (allCats.map(c=>c.slug) as any)
  const needed = cfg.rows * 3
  const slugs: string[] = Array.from({length: needed}, (_,i)=> order[i % order.length] as string)
  const rows = chunk(slugs, 3)

  return (
    <section className="mt-8 space-y-8">
      {rows.map((row, idx)=> (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {row.map((slug, i) => {
            const cat = allCats.find(c=> c.slug===slug)
            return <Column key={slug+"-"+i} slug={slug} title={cat?.name || slug} listCount={cfg.listCount} />
          })}
        </div>
      ))}
    </section>
  )
}

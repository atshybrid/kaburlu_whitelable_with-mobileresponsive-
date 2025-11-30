import Image from 'next/image'
import Link from 'next/link'
import { getBelowHeroConfig } from '../lib/uiConfig'
import { chunk } from '../lib/ui'
import { fetchShortNews, normalizeShortNews, groupByCategory, type NormalizedShortArticle } from '../lib/api'
import ExternalLink from './ExternalLink'

function SectionTitle({children}:{children:React.ReactNode}){
  return (
    <div className="inline-block bg-[#255db1] text-white text-sm font-bold px-3 py-1 rounded">{children}</div>
  )
}

function Column({ title, listCount, items }: { title: string, listCount: number, items: NormalizedShortArticle[] }){
  if (!items.length) return null
  const topIndex = Math.max(0, items.findIndex(i => !!i.image))
  const top = topIndex >= 0 ? (items[topIndex] || items[0]) : items[0]

  // Build a list starting right after the chosen top, prefer unique IDs; if still short, allow repeats
  const ordered = items.slice((topIndex + 1) % items.length).concat(items.slice(0, (topIndex + 1) % items.length))
  const seen = new Set<string>([top.id])
  const unique: NormalizedShortArticle[] = []
  for (const it of ordered) {
    if (!seen.has(it.id)) { seen.add(it.id); unique.push(it) }
    if (unique.length >= listCount) break
  }
  let list: NormalizedShortArticle[] = unique
  if (list.length < listCount) {
    // If not enough unique items, fill remaining slots by cycling from the start (excluding top) even if duplicates
    let idx = 0
    while (list.length < listCount && idx < ordered.length * 2) {
      const it = ordered[idx % ordered.length]
      if (it.id !== top.id) list.push(it)
      idx++
    }
  }
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-2 rounded border bg-white/70 dark:bg-gray-900/40 overflow-hidden">
        {/* top image card */}
        <div className="p-3">
          {top.image ? (
            <div className="relative w-full aspect-[4/3] rounded overflow-hidden">
              <Image src={top.image} alt={top.title} fill className="object-cover" sizes="(min-width:768px) 25vw, 90vw" />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded bg-gray-200 dark:bg-gray-800" />
          )}
          <ExternalLink href={top.href} className="mt-2 block text-[16px] font-semibold hover:text-indigo-700 line-clamp-2">{top.title}</ExternalLink>
        </div>
        {/* bullets */}
        <ul className="px-3 pb-2 divide-y divide-dotted divide-gray-300">
          {list.map((a, idx) => (
            <li key={`${a.id}-${idx}`} className="py-2">
              <ExternalLink href={a.href} className="flex items-start gap-2">
                <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-gray-700" />
                <span className="text-[15px] leading-snug hover:text-indigo-700 line-clamp-2">{a.title}</span>
              </ExternalLink>
            </li>
          ))}
        </ul>
        <div className="p-3 flex justify-center">
          <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-[#255db1] border border-[#255db1]/40 rounded-full px-4 py-1.5">More »</a>
        </div>
      </div>
    </div>
  )
}

// Take `count` items from `arr`, starting at `start`, cycling to the beginning if needed
function takeCycled<T>(arr: T[], start: number, count: number): T[] {
  const out: T[] = []
  const n = arr.length
  if (n === 0 || count <= 0) return out
  for (let i = 0; i < count; i++) {
    out.push(arr[(start + i) % n])
  }
  return out
}

export default async function ThreeColNews(){
  const cfg = getBelowHeroConfig()
  // fetch short news and group by category
  const res = await fetchShortNews({ limit: Math.max(40, cfg.rows * 3 * (cfg.listCount + 2)) })
  const items = normalizeShortNews(res.data)
  const grouped = groupByCategory(items)
  // sort categories by number of items desc
  const categories = Object.keys(grouped).sort((a,b)=> (grouped[b]?.length||0)-(grouped[a]?.length||0))
  const needed = cfg.rows * 3
  const forced = process.env.NEXT_PUBLIC_SECTION2_FORCE_CATEGORY_NAME?.trim()
  const perCol = cfg.listCount + 1 // top + list
  let selected: string[]
  if (forced && grouped[forced]?.length) {
    selected = Array.from({ length: needed }, () => forced as string)
  } else {
    const eligible = categories.filter(c => (grouped[c]?.length || 0) >= perCol)
    if (eligible.length >= needed) {
      selected = eligible.slice(0, needed)
    } else if (eligible.length > 0) {
      // Not enough categories with sufficient items; cycle the best ones to fill remaining slots
      selected = []
      for (let i = 0; i < needed; i++) selected.push(eligible[i % eligible.length])
    } else {
      // Fallback: take top categories even if short
      selected = categories.slice(0, needed)
    }
  }
  const rows = chunk(selected, 3)

  return (
    <section className="mt-8 space-y-8">
      {rows.map((row, idx)=> (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {row.map((catName, i) => {
            const all = grouped[catName] || []
            // When forcing a single category for all columns, offset items so columns show different entries
            const offset = (forced ? (idx * 3 + i) * perCol : 0)
            const need = perCol + 3 // a little headroom to prefer an image for top
            const itemsForCol = forced
              ? (all.length >= need ? all.slice(offset, offset + need) : takeCycled(all, offset, need))
              : all.slice(0, Math.max(need, cfg.listCount + 2))
            return (
              <Column key={catName+"-"+i} title={catName} listCount={cfg.listCount} items={itemsForCol} />
            )
          })}
        </div>
      ))}
    </section>
  )
}

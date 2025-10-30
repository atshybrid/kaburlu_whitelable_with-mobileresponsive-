import Link from 'next/link'
import { getCategories, getTrending } from '../lib/data'

export default function HashtagBar() {
  const cats = getCategories().filter(c => c.slug !== 'top')
  const trending = getTrending(6)
  const tags = [
    { label: '#latestnews', href: '/' },
    ...cats.slice(0,6).map(c => ({ label: `#${c.name.toLowerCase()}`, href: `/category/${c.slug}` })),
    ...trending.slice(0,4).map(t => ({ label: `#${t.category.name.toLowerCase()}` , href: `/category/${t.category.slug}` }))
  ]
  // de-dup
  const seen = new Set<string>()
  const uniq = tags.filter(t=>{
    if(seen.has(t.label)) return false; seen.add(t.label); return true
  }).slice(0,10)

  return (
    <div className="border-b border-gray-100 dark:border-gray-800/80">
      <div className="max-w-[var(--site-max)] mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto text-sm">
        {uniq.map(t => (
          <Link key={t.label} href={t.href} className="shrink-0 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

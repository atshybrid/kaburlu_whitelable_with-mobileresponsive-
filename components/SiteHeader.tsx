import Link from 'next/link'
import { getCategories, getTrending } from '../lib/data'
import ThemeToggle from './ThemeToggle'

// A compact caret icon
function Caret() {
  return (
    <svg className="w-3.5 h-3.5 inline-block" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.2l3.71-3.97a.75.75 0 1 1 1.08 1.04l-4.24 4.53a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"/>
    </svg>
  )
}

export default function SiteHeader() {
  const cats = getCategories().filter(c=> c.slug !== 'top' && c.slug !== 'latest')
  const trending = getTrending(5)
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'
  })

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 header">
      {/* Utility strip */}
      <div className="hidden md:block border-b border-gray-100 dark:border-gray-800/80">
        <div className="max-w-[var(--site-max)] mx-auto px-4 py-2 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
              <span>Telugu Edition</span>
              <Caret />
            </button>
            <span className="text-gray-400">|</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="px-3 py-1.5 rounded border border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50/60 dark:hover:bg-indigo-600/10">Download App</a>
            <button className="hidden lg:inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
              <span>Choose City</span>
              <Caret />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <a href="#" className="inline-flex items-center px-2.5 py-1 rounded bg-[#255db1] text-white text-[12px] font-semibold">E Paper</a>
              <a href="#" className="inline-flex items-center px-2.5 py-1 rounded bg-[#0ea5e9] text-white text-[12px] font-semibold">TG-Dynamic</a>
              <a href="#" className="inline-flex items-center px-2.5 py-1 rounded bg-[#22c55e] text-white text-[12px] font-semibold">AP-Dynamic</a>
            </div>
            <div className="hidden lg:flex items-center">
              <input
                type="search"
                placeholder="Search"
                className="w-40 rounded-l border border-gray-300/80 dark:border-gray-700 bg-white/70 dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none"
              />
              <button className="rounded-r border border-l-0 border-gray-300/80 dark:border-gray-700 px-3 py-1 text-sm text-gray-600 dark:text-gray-300">Go</button>
            </div>
            <a href="#" className="px-3 py-1.5 rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90">Sign in</a>
          </div>
        </div>
      </div>

      {/* Primary bar */}
      <div className="max-w-[var(--site-max)] mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-grid place-items-center w-9 h-9 rounded-sm bg-red-600 text-white text-[10px] leading-none font-black tracking-wider">
            NEWS
          </span>
          <span className="text-2xl font-extrabold tracking-tight">DailyBrief</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-800 dark:text-gray-200">
          {cats.map(c => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="hover:text-indigo-600 whitespace-nowrap">
              {c.name}
            </Link>
          ))}
          <button className="ml-1 inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:hover:text-white">
            More <Caret />
          </button>
        </nav>
        <div className="ml-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Trending strip */}
      <div className="border-t border-gray-100 dark:border-gray-800/80">
        <div className="max-w-[var(--site-max)] mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto">
          <span className="shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-gray-900 dark:text-white">
            <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.09 6.41H21l-5.18 3.77L16.91 19 12 15.77 7.09 19l1.09-6.82L3 8.41h6.91L12 2z"/></svg>
            Trending
          </span>
          <ul className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {trending.map(t => (
              <li key={t.id} className="min-w-fit">
                <Link href={`/article/${t.slug}`} className="hover:text-indigo-600">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Sticky category bar (yellow) */}
      <div className="sticky top-0 z-30 bg-[#ffd400] border-y border-yellow-300">
        <div className="max-w-[var(--site-max)] mx-auto px-3">
          <ul className="flex items-center gap-4 overflow-x-auto py-2 text-[15px] font-semibold text-black">
            {cats.slice(0,14).map(c => (
              <li key={c.slug} className="min-w-fit"><Link href={`/category/${c.slug}`} className="hover:underline">{c.name}</Link></li>
            ))}
            <li className="ml-auto min-w-fit"><button className="hover:underline">More</button></li>
          </ul>
        </div>
      </div>
    </header>
  )
}

"use client"
import Link from 'next/link'
import { getCategories } from '../lib/data'

function formatNow(){
  const now = new Date()
  return now.toLocaleString('en-IN', {weekday:'short', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})
}

export default function HeaderDisha(){
  const cats = getCategories().filter(c=> c.slug !== 'top' && c.slug !== 'latest')
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Utility strip */}
      <div className="hidden md:block border-b border-gray-100 dark:border-gray-800/80">
        <div className="max-w-[var(--site-max)] mx-auto px-4 h-9 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
          <div>{formatNow()}</div>
          <div className="flex items-center gap-2">
            <a className="inline-flex items-center px-2 py-0.5 rounded bg-[#255db1] text-white font-semibold" href="#">E Paper</a>
            <a className="inline-flex items-center px-2 py-0.5 rounded bg-[#0ea5e9] text-white font-semibold" href="#">TG-Dynamic</a>
            <a className="inline-flex items-center px-2 py-0.5 rounded bg-[#22c55e] text-white font-semibold" href="#">AP-Dynamic</a>
          </div>
        </div>
      </div>

      {/* Logo row */}
      <div className="max-w-[var(--site-max)] mx-auto px-4 py-4 flex items-center">
        <Link href="/" className="inline-flex items-center">
          <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#255db1]">దిశ</span>
          <span className="ml-2 text-xs text-gray-500">…towards truth</span>
        </Link>
      </div>

      {/* Yellow category bar */}
      <div className="bg-[#ffd400] border-t border-yellow-300 sticky top-0 z-30">
        <div className="max-w-[var(--site-max)] mx-auto px-3">
          <ul className="flex items-center gap-4 overflow-x-auto py-2 text-[15px] font-semibold text-black">
            <li className="min-w-fit"><Link href="/">Home</Link></li>
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

"use client"
import Link from 'next/link'
import { getAllArticles } from '../lib/data'

export default function TopCategoryBar(){
  // Derive unique categories from articles
  const cats = Array.from(new Map(getAllArticles().map(a => [a.category.slug, a.category])).values())
  return (
    <nav aria-label="Top categories" className="w-full mt-4">
      <div className="rounded bg-[#ffd400] text-black shadow border border-yellow-300">
        <ul className="flex flex-wrap items-center gap-3 px-3 py-2 text-[15px] font-semibold">
          {cats.slice(0,12).map(c => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="hover:underline">
                {c.name}
              </Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link href="#" className="hover:underline">More</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

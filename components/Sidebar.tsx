import Link from 'next/link'
import { getTrending, getMostRead, getCategories } from '../lib/data'

export default function Sidebar() {
  const trending = getTrending(5)
  const mostRead = getMostRead(5)
  const cats = getCategories().filter(c => c.slug !== 'top' && c.slug !== 'latest')
  return (
    <aside className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-semibold mb-3">Trending</h4>
        <ul className="space-y-3">
          {trending.map((a,i)=> (
            <li key={a.id} className="flex gap-3">
              <span className="w-5 text-right text-xs font-bold text-gray-400">{i+1}</span>
              <Link href={`/article/${a.slug}`} className="text-sm hover:underline line-clamp-2">{a.title}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-semibold mb-3">Most Read</h4>
        <ul className="space-y-2">
          {mostRead.map(a=> (
            <li key={a.id}>
              <Link href={`/article/${a.slug}`} className="text-sm hover:underline line-clamp-2">{a.title}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-semibold mb-2">Categories</h4>
        <div className="flex flex-wrap gap-2">
          {cats.map(c => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">{c.name}</Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-4">
        <h4 className="font-semibold mb-1">Daily Brief</h4>
        <p className="text-sm text-white/90">Get the 5 top stories in your inbox every morning.</p>
        <form className="mt-3 flex">
          <input type="email" placeholder="you@example.com" className="flex-1 px-3 py-2 rounded-l bg-white text-gray-900 text-sm" />
          <button className="px-3 py-2 bg-black/20 rounded-r text-sm font-medium">Subscribe</button>
        </form>
      </div>
    </aside>
  )
}

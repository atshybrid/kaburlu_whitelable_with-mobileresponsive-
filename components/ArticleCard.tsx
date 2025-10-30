import Link from 'next/link'
import { Article } from '../lib/types'

export default function ArticleCard({ a, compact=false }: { a: Article, compact?: boolean }) {
  return (
    <Link href={`/article/${a.slug}`} className="block">
      <article className={`flex gap-3 items-start bg-white dark:bg-gray-800 ${compact? 'p-3':'p-4'} border-b border-gray-200 dark:border-gray-700`}>
        <img src={a.thumb || 'https://picsum.photos/seed/thumb/400/300'} alt={a.title} className={(compact? 'w-24 h-16' : 'w-32 h-20') + ' object-cover rounded-md flex-shrink-0'} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-indigo-600 font-semibold uppercase tracking-wide">{a.category.name}</div>
          <h3 className={`font-semibold ${compact? 'text-sm':'text-base'} line-clamp-2`}>{a.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.summary}</p>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">{new Date(a.publishedAt).toLocaleString()} • {a.readTime}m • {a.reporter.name}</div>
        </div>
      </article>
    </Link>
  )
}

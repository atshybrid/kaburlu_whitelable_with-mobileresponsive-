import Link from 'next/link'
import { Article } from '../lib/types'
import ArticleCard from './ArticleCard'

export default function CategorySection({ title, slug, items }: { title: string, slug: string, items: Article[] }) {
  if (!items.length) return null
  return (
    <section id={slug} className="mt-6 scroll-mt-16">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <Link href={`/category/${slug}`} className="text-sm text-indigo-600 hover:underline">View all</Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {items.map(a => <ArticleCard key={a.id} a={a} />)}
      </div>
    </section>
  )
}

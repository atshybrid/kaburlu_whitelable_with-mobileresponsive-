import Link from 'next/link'
import { Article } from '../lib/types'

export default function Hero({ stories }: { stories: Article[] }) {
  if (!stories.length) return null
  const [lead, ...rest] = stories
  return (
    <section className="grid md:grid-cols-3 gap-4">
      <Link href={`/article/${lead.slug}`} className="md:col-span-2">
        <article className="group relative h-64 md:h-[360px] overflow-hidden rounded-xl">
          <img src={lead.hero || lead.thumb || 'https://picsum.photos/seed/hero/1200/800'} alt={lead.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 p-4 md:p-6 text-white">
            <span className="inline-flex items-center text-xs bg-indigo-600/90 px-2 py-0.5 rounded">{lead.category.name}</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold leading-tight group-hover:underline">{lead.title}</h2>
            <p className="hidden md:block text-white/90 mt-2 line-clamp-2">{lead.summary}</p>
          </div>
        </article>
      </Link>
      <div className="grid grid-rows-2 gap-4">
        {rest.slice(0,2).map(a => (
          <Link key={a.id} href={`/article/${a.slug}`} className="block">
            <article className="h-40 relative overflow-hidden rounded-xl">
              <img src={a.hero || a.thumb || 'https://picsum.photos/seed/side/800/600'} alt={a.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 p-3 text-white">
                <span className="inline-flex items-center text-[10px] bg-black/60 px-2 py-0.5 rounded">{a.category.name}</span>
                <h3 className="mt-1 text-lg font-bold leading-tight line-clamp-2">{a.title}</h3>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}

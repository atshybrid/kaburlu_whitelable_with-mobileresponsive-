import Link from 'next/link'
import type { Article } from '@/lib/data-sources'

export function TrendingStrip({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap border-y bg-zinc-50 px-4 py-2 text-sm">
      <span className="font-semibold text-red-600">FLASH NEWS</span>
      {items.map((a) => (
        <Link key={a.id} href={`/t/${tenantSlug}/article/${a.slug}` as any} className="hover:text-blue-600">
          {a.title}
        </Link>
      ))}
    </div>
  )
}

import { ArticleCard } from './ArticleCard'
import type { Article } from '@/lib/data-sources'

export function ArticleGrid({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <ArticleCard key={a.id} tenantSlug={tenantSlug} article={a} />
      ))}
    </div>
  )
}

import type { Article } from '@/lib/data-sources'
import { TOITickerClient } from './TOITickerClient'

export function TOITicker({ 
  tenantSlug, 
  items 
}: { 
  tenantSlug: string
  items: Article[] 
}) {
  const tickerItems = items.slice(0, 10).map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
  }))

  return <TOITickerClient tenantSlug={tenantSlug} items={tickerItems} />
}

import { getCategoriesForNav } from '@/lib/categories'
import { categoryHref, homeHref } from '@/lib/url'
import MobileBottomNavClient from './MobileBottomNavClient'

// Safe category name extraction
function extractCategoryName(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    if (obj.name && typeof obj.name === 'string') return obj.name
    if (obj.name && typeof obj.name === 'object') {
      const nested = obj.name as Record<string, unknown>
      if (nested.name && typeof nested.name === 'string') return nested.name
    }
    if (obj.slug && typeof obj.slug === 'string') return obj.slug
  }
  return String(val)
}

export default async function MobileBottomNav({ tenantSlug, latestCategorySlug }: { tenantSlug: string; latestCategorySlug?: string }) {
  const cats = await getCategoriesForNav()
  const top = cats.filter((c) => !c.parentId).slice(0, 16)
  const categories = top.map((c) => ({ label: extractCategoryName(c.name), href: categoryHref(tenantSlug, c.slug) }))
  const latestHref = latestCategorySlug ? categoryHref(tenantSlug, latestCategorySlug) : undefined
  return (
    <MobileBottomNavClient homeHref={homeHref(tenantSlug)} latestHref={latestHref} categories={categories} />
  )
}

import { getCategoriesForNav } from '@/lib/categories'
import { categoryHref, homeHref } from '@/lib/url'
import MobileBottomNavClient from './MobileBottomNavClient'

export default async function MobileBottomNav({ tenantSlug, latestCategorySlug }: { tenantSlug: string; latestCategorySlug?: string }) {
  const cats = await getCategoriesForNav()
  const top = cats.filter((c) => !c.parentId).slice(0, 16)
  const categories = top.map((c) => ({ label: c.name, href: categoryHref(tenantSlug, c.slug) }))
  const latestHref = latestCategorySlug ? categoryHref(tenantSlug, latestCategorySlug) : undefined
  return (
    <MobileBottomNavClient homeHref={homeHref(tenantSlug)} latestHref={latestHref} categories={categories} />
  )
}

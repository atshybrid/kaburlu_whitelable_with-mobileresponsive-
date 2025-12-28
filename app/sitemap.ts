import { prisma } from '@/lib/db'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenants = await prisma.tenant.findMany({})
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const urls: MetadataRoute.Sitemap = tenants.map((t) => ({ url: `${base}/t/${t.slug}`, lastModified: new Date() }))
  for (const t of tenants) {
    const arts = await prisma.article.findMany({ where: { tenantId: t.id, status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } })
    arts.forEach((a) => urls.push({ url: `${base}/t/${t.slug}/article/${a.slug}`, lastModified: a.updatedAt }))
  }
  return urls
}

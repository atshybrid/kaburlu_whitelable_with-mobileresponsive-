import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Vercel (and other CI providers) do not automatically load your local `.env`.
  // If DATABASE_URL isn't configured in the deployment environment, avoid hitting Prisma
  // during build-time prerender of /sitemap.xml.
  if (!process.env.DATABASE_URL) {
    return [{ url: base, lastModified: new Date() }]
  }

  const { prisma } = await import('@/lib/db')
  const tenants = await prisma.tenant.findMany({})
  const urls: MetadataRoute.Sitemap = tenants.map((t) => ({ url: `${base}/t/${t.slug}`, lastModified: new Date() }))
  for (const t of tenants) {
    const arts = await prisma.article.findMany({ where: { tenantId: t.id, status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } })
    arts.forEach((a) => urls.push({ url: `${base}/t/${t.slug}/article/${a.slug}`, lastModified: a.updatedAt }))
  }
  return urls
}

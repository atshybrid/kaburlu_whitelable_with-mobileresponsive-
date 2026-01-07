import type { MetadataRoute } from 'next'
import { LEGAL_PAGE_KEYS } from '@/lib/legal-pages'

function stripTrailingSlash(url: string) {
  return String(url || '').replace(/\/+$/, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

  // Vercel (and other CI providers) do not automatically load your local `.env`.
  // If DATABASE_URL isn't configured in the deployment environment, avoid hitting Prisma
  // during build-time prerender of /sitemap.xml.

    // Remote-only mode: keep sitemap minimal to avoid any DB dependency.
  const now = new Date()
  return [
    { url: base, lastModified: now },
    ...LEGAL_PAGE_KEYS.map((slug) => ({ url: `${base}/${slug}`, lastModified: now })),
  ]
}

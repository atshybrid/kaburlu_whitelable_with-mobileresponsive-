import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Vercel (and other CI providers) do not automatically load your local `.env`.
  // If DATABASE_URL isn't configured in the deployment environment, avoid hitting Prisma
  // during build-time prerender of /sitemap.xml.

    // Remote-only mode: keep sitemap minimal to avoid any DB dependency.
    return [
      {
        url: base,
        lastModified: new Date(),
      },
    ]
}

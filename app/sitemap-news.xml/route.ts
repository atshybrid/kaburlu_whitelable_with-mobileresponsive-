import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'
import { fetchFeedArticles, generateGoogleNewsSitemap, getFeedSiteMeta } from '@/lib/feed'

/**
 * Google News Sitemap (sitemap-news.xml)
 *
 * Includes news:news tags for articles published in the last 48 hours.
 * Required for Google Publisher Center / Google News indexing.
 *
 * Submit this URL in:
 * - Google Search Console → Sitemaps
 * - Google Publisher Center → Content → Sitemaps
 */
export async function GET() {
  try {
    const domain = await getTenantDomain()
    const meta = await getFeedSiteMeta(domain)
    const articles = await fetchFeedArticles(domain, 1000, meta.cacheTTL)

    const sitemap = generateGoogleNewsSitemap({
      siteUrl: meta.siteUrl,
      siteName: meta.siteName,
      language: meta.language,
      articles,
    })

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900',
      },
    })
  } catch (error) {
    console.error('Error generating news sitemap:', error)

    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`

    return new NextResponse(fallback, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 900

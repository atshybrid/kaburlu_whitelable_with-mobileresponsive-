import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'
import { fetchFeedArticles, generateRssFeed, getFeedSiteMeta } from '@/lib/feed'

/**
 * RSS 2.0 Feed — /rss
 *
 * Used by:
 * - Google Publisher Center (primary feed URL)
 * - RSS readers and aggregators
 * - Google News discovery
 */
export async function GET() {
  try {
    const domain = await getTenantDomain()
    const meta = await getFeedSiteMeta(domain)
    const articles = await fetchFeedArticles(domain, 50, meta.cacheTTL)

    const rss = generateRssFeed({
      siteUrl: meta.siteUrl,
      siteName: meta.siteName,
      description: meta.description,
      language: meta.language,
      articles,
      feedUrl: `${meta.siteUrl}/rss`,
    })

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse(
      `<?xml version="1.0"?><rss version="2.0"><channel><title>Feed Error</title></channel></rss>`,
      { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 900

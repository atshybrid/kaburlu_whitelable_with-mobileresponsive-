import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'

/**
 * Sitemap Index (sitemap-index.xml)
 * 
 * Master sitemap that references all other sitemaps.
 * This is what robots.txt should point to.
 * 
 * References:
 * - sitemap.xml       → Static pages (homepage, about, contact, etc.)
 * - sitemap-news.xml  → All news articles
 * 
 * Google News Best Practice:
 * - Use sitemap index for large sites
 * - Separate static and dynamic content
 * - Reference absolute URLs
 * - Include lastmod for each sitemap
 * 
 * Robots.txt should contain:
 * Sitemap: https://yourdomain.com/sitemap-index.xml
 */
export async function GET() {
  try {
    const domain = await getTenantDomain()
    const protocol = domain.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${domain}`
    
    const now = new Date().toISOString()
    
    // List of all sitemaps
    const sitemaps = [
      {
        loc: `${baseUrl}/sitemap.xml`,
        lastmod: now,
        // Static pages change infrequently
      },
      {
        loc: `${baseUrl}/sitemap-news.xml`,
        lastmod: now,
        // News articles change frequently
      }
    ]
    
    // Build sitemap index XML
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`
    
    return new NextResponse(sitemapIndex, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating sitemap index:', error)
    
    // Fallback minimal index
    const fallbackIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://kaburlutoday.com/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://kaburlutoday.com/sitemap-news.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`
    
    return new NextResponse(fallbackIndex, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8'
      }
    })
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'
import { LEGAL_PAGE_KEYS } from '@/lib/legal-pages'

/**
 * Static Pages Sitemap (sitemap.xml)
 * 
 * Contains ONLY static pages:
 * - Homepage
 * - About, Contact, Privacy Policy, Terms, etc.
 * 
 * Article URLs are in sitemap-news.xml
 * Both are referenced by sitemap-index.xml
 * 
 * Google News Best Practice: Separate static and dynamic content
 */
export async function GET() {
  try {
    const domain = await getTenantDomain()
    const protocol = domain.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${domain}`
    
    const now = new Date().toISOString()
    
    // Static pages only
    const staticPages = [
      {
        loc: baseUrl,
        lastmod: now,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${baseUrl}/contact`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.7
      },
      // Legal and informational pages
      ...LEGAL_PAGE_KEYS.map((slug) => ({
        loc: `${baseUrl}/${slug}`,
        lastmod: now,
        changefreq: 'monthly',
        priority: slug === 'about-us' ? 0.8 : 0.5
      }))
    ]
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPages.map(page => `  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating static sitemap:', error)
    
    // Fallback - minimal valid sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kaburlutoday.com</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    
    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8'
      }
    })
  }
}

// Escape XML special characters
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

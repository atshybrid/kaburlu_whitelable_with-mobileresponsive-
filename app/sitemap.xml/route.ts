import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'
import { LEGAL_PAGE_KEYS } from '@/lib/legal-pages'

/**
 * Dynamic Sitemap Generator for Multi-Tenant Setup
 * 
 * This generates sitemap.xml dynamically based on the actual domain
 * making the request, ensuring correct URLs for each tenant.
 */
export async function GET() {
  try {
    // Get the actual domain from headers (set by middleware)
    const domain = await getTenantDomain()
    
    // Use https for production domains, http for localhost
    const protocol = domain.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${domain}`
    
    const now = new Date().toISOString()
    
    // Build sitemap URLs
    const urls = [
      // Homepage
      {
        loc: baseUrl,
        lastmod: now,
        changefreq: 'daily',
        priority: 1.0
      },
      // Legal pages
      ...LEGAL_PAGE_KEYS.map((slug) => ({
        loc: `${baseUrl}/${slug}`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.5
      })),
      // Contact page
      {
        loc: `${baseUrl}/contact`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.7
      }
    ]
    
    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback sitemap
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
        'Content-Type': 'application/xml'
      }
    })
  }
}

// Make this route dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

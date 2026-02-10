import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'

/**
 * Dynamic Robots.txt Generator for Multi-Tenant Setup
 * 
 * This generates robots.txt dynamically based on the actual domain
 * making the request, ensuring correct sitemap URL for each tenant.
 */
export async function GET() {
  try {
    // Get the actual domain from headers (set by middleware)
    const domain = await getTenantDomain()
    
    // Use https for production domains, http for localhost
    const protocol = domain.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${domain}`
    
    const robotsTxt = `# Robots.txt for ${domain}
# Telugu News Website - Optimized for Google News

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Crawl Delay (optional - use if needed)
# Crawl-delay: 1

# Sitemap Index (references all sitemaps)
Sitemap: ${baseUrl}/sitemap-index.xml

# Individual Sitemaps (for direct reference)
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-news.xml
`
    
    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
    
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    
    // Fallback robots.txt
    const fallbackRobots = `# Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: https://kaburlutoday.com/sitemap-index.xml
Sitemap: https://kaburlutoday.com/sitemap.xml
Sitemap: https://kaburlutoday.com/sitemap-news.xml
`
    
    return new NextResponse(fallbackRobots, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}

// Make this route dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

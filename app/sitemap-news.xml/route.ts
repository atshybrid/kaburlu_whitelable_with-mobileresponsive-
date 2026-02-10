import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'
import { fetchJSON } from '@/lib/remote'
import { getConfig, getCacheTTL } from '@/lib/config'

/**
 * News Articles Sitemap (sitemap-news.xml)
 * 
 * Contains ALL published article URLs from the backend API.
 * Optimized for Google News and fast indexing of fresh content.
 * 
 * Features:
 * - Fetches articles from /public/articles API
 * - Includes lastmod timestamp for each article
 * - High priority (0.8-0.9) for news content
 * - Hourly changefreq for fresh articles
 * - Handles pagination if needed
 * - Safe fallback if API fails
 * 
 * Google News Best Practices:
 * - Separate from static content
 * - Include accurate lastmod dates
 * - High update frequency
 * - Clean, absolute URLs without query params
 */

interface ArticleListItem {
  slug: string
  title?: string
  published_at?: string
  publishedAt?: string
  updated_at?: string
  updatedAt?: string
  category?: {
    slug?: string
    name?: string
  }
}

interface ArticlesResponse {
  status?: string
  data?: ArticleListItem[]
  items?: ArticleListItem[]
  articles?: ArticleListItem[]
  pagination?: {
    total?: number
    page?: number
    pageSize?: number
  }
}

export async function GET() {
  try {
    const domain = await getTenantDomain()
    const protocol = domain.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${domain}`
    
    // Get configuration
    const config = await getConfig()
    const cacheTTL = getCacheTTL(config, 'article') // Use article cache TTL for news
    
    // Fetch articles from API
    // For news sites with high publishing frequency, fetch enough articles
    // Google can handle sitemaps up to 50,000 URLs
    const pageSize = 1000 // Adjust based on your needs
    const articles = await fetchArticlesForSitemap(domain, pageSize, cacheTTL)
    
    if (!articles || articles.length === 0) {
      // Return minimal valid sitemap even if no articles
      return emptyNewsSitemap()
    }
    
    // Build article URLs
    const articleUrls = articles.map(article => {
      const categorySlug = article.category?.slug || 'news'
      const articleSlug = article.slug
      
      // Use published/updated dates
      const publishedAt = article.published_at || article.publishedAt
      const updatedAt = article.updated_at || article.updatedAt
      const lastmod = updatedAt || publishedAt || new Date().toISOString()
      
      // Priority based on recency
      const pubDate = new Date(publishedAt || Date.now())
      const daysSincePublished = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
      let priority = 0.9
      if (daysSincePublished > 7) priority = 0.8
      if (daysSincePublished > 30) priority = 0.7
      
      // Changefreq based on age
      let changefreq = 'hourly'
      if (daysSincePublished > 1) changefreq = 'daily'
      if (daysSincePublished > 7) changefreq = 'weekly'
      
      return {
        loc: `${baseUrl}/${categorySlug}/${articleSlug}`,
        lastmod,
        changefreq,
        priority
      }
    })
    
    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${articleUrls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800' // 30 min cache for news
      }
    })
    
  } catch (error) {
    console.error('Error generating news sitemap:', error)
    
    // Return valid empty sitemap on error - don't break Google's crawl
    return emptyNewsSitemap()
  }
}

/**
 * Fetch articles from backend API for sitemap
 */
async function fetchArticlesForSitemap(
  domain: string,
  pageSize: number,
  cacheTTL: number
): Promise<ArticleListItem[]> {
  try {
    const response = await fetchJSON<ArticlesResponse>(
      `/public/articles?page=1&pageSize=${pageSize}&sortBy=publishedAt&order=desc`,
      {
        tenantDomain: domain,
        revalidateSeconds: cacheTTL
      }
    )
    
    if (!response) return []
    
    // Handle different response structures
    const articles = response.data || response.items || response.articles || []
    
    // Filter out articles without slugs
    return articles.filter(article => article.slug)
    
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
    return []
  }
}

/**
 * Return minimal valid empty sitemap
 */
function emptyNewsSitemap(): NextResponse {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- No articles available at this time -->
</urlset>`
  
  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300' // 5 min cache for empty state
    }
  })
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

// Force dynamic rendering for fresh article data
export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Revalidate every 30 minutes

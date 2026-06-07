/**
 * RSS Feed + Google News feed utilities
 * Shared by /rss, /feed.xml, and sitemap-news.xml
 */

import { fetchJSON } from '@/lib/remote'
import { getConfig, getCacheTTL } from '@/lib/config'

export interface FeedArticle {
  slug: string
  title?: string
  excerpt?: string
  summary?: string
  description?: string
  contentHtml?: string
  plainText?: string
  publishedAt?: string
  published_at?: string
  updatedAt?: string
  updated_at?: string
  coverImageUrl?: string
  coverImage?: { url?: string | null; alt?: string | null } | null
  category?: { slug?: string; name?: string }
  author?: { name?: string; displayName?: string }
  authorName?: string
}

interface ArticlesResponse {
  data?: FeedArticle[]
  items?: FeedArticle[]
  articles?: FeedArticle[]
}

export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function toRfc822Date(input?: string | null): string {
  const d = input ? new Date(input) : new Date()
  if (Number.isNaN(d.getTime())) return new Date().toUTCString()
  return d.toUTCString()
}

export function toIsoDate(input?: string | null): string {
  const d = input ? new Date(input) : new Date()
  if (Number.isNaN(d.getTime())) return new Date().toISOString()
  return d.toISOString()
}

/** Map tenant language to Google News / RSS language code */
export function normalizeFeedLanguage(language?: string): string {
  const raw = String(language || 'te').trim().toLowerCase()
  if (raw === 'telugu') return 'te'
  if (raw === 'hindi') return 'hi'
  if (raw === 'tamil') return 'ta'
  if (raw === 'kannada') return 'kn'
  if (raw === 'english') return 'en'
  return raw.split('-')[0] || 'te'
}

export function getArticlePublishedAt(article: FeedArticle): string | undefined {
  return article.publishedAt || article.published_at
}

export function getArticleUpdatedAt(article: FeedArticle): string | undefined {
  return article.updatedAt || article.updated_at || getArticlePublishedAt(article)
}

export function getArticleImage(article: FeedArticle): string | undefined {
  return article.coverImageUrl || article.coverImage?.url || undefined
}

export function getArticleExcerpt(article: FeedArticle, maxLen = 500): string {
  const raw =
    article.excerpt ||
    article.summary ||
    article.description ||
    (article.plainText ? article.plainText.slice(0, maxLen) : '') ||
    (article.contentHtml ? stripHtml(article.contentHtml).slice(0, maxLen) : '') ||
    article.title ||
    ''

  const text = stripHtml(String(raw))
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text
}

export function getArticleAuthor(article: FeedArticle, fallback: string): string {
  return (
    article.author?.name ||
    article.author?.displayName ||
    article.authorName ||
    fallback
  )
}

export function buildArticleUrl(baseUrl: string, article: FeedArticle): string {
  const categorySlug = article.category?.slug || 'news'
  return `${baseUrl}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(article.slug)}`
}

/** Fetch recent articles for RSS / sitemap feeds */
export async function fetchFeedArticles(
  domain: string,
  pageSize = 50,
  cacheTTL?: number,
): Promise<FeedArticle[]> {
  try {
    const ttl = cacheTTL ?? 1800
    const response = await fetchJSON<ArticlesResponse>(
      `/public/articles?page=1&pageSize=${pageSize}&sortBy=publishedAt&order=desc`,
      { tenantDomain: domain, revalidateSeconds: ttl },
    )

    if (!response) return []

    const articles = response.data || response.items || response.articles || []
    return articles.filter((a) => a.slug)
  } catch (error) {
    console.error('Error fetching feed articles:', error)
    return []
  }
}

export async function getFeedSiteMeta(domain: string) {
  const protocol = domain.includes('localhost') ? 'http' : 'https'
  const siteUrl = `${protocol}://${domain}`

  const config = await getConfig()
  const siteName =
    config?.branding?.siteName ||
    config?.tenant?.displayName ||
    domain

  const description =
    config?.seo?.meta?.description ||
    `${siteName} — latest news and breaking updates`

  const language = normalizeFeedLanguage(config?.content?.defaultLanguage)
  const cacheTTL = getCacheTTL(config, 'article')

  return { siteUrl, siteName, description, language, cacheTTL, config }
}

/** Generate RSS 2.0 XML (Google Publisher Center compatible) */
export function generateRssFeed(opts: {
  siteUrl: string
  siteName: string
  description: string
  language: string
  articles: FeedArticle[]
  feedUrl?: string
  maxItems?: number
}): string {
  const {
    siteUrl,
    siteName,
    description,
    language,
    articles,
    feedUrl = `${siteUrl}/rss`,
    maxItems = 50,
  } = opts

  const items = articles.slice(0, maxItems)
  const now = new Date().toUTCString()
  const buildDate = items[0]
    ? toRfc822Date(getArticlePublishedAt(items[0]))
    : now

  const itemXml = items
    .map((article) => {
      const url = buildArticleUrl(siteUrl, article)
      const pubDate = toRfc822Date(getArticlePublishedAt(article))
      const excerpt = escapeXml(getArticleExcerpt(article))
      const title = escapeXml(article.title || article.slug)
      const author = escapeXml(getArticleAuthor(article, siteName))
      const category = article.category?.name
        ? `\n      <category>${escapeXml(article.category.name)}</category>`
        : ''
      const image = getArticleImage(article)
      const enclosure = image
        ? `\n      <enclosure url="${escapeXml(image)}" type="image/jpeg" length="0" />`
        : ''
      const media = image
        ? `\n      <media:content url="${escapeXml(image)}" medium="image" />`
        : ''

      return `    <item>
      <title>${title}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${excerpt}</description>
      <author>${author}</author>${category}${enclosure}${media}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrt/mrss"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>${escapeXml(language)}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <generator>Kaburlu News Platform</generator>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${itemXml}
  </channel>
</rss>`
}

/** Articles published within the last N hours (Google News sitemap: 48h) */
export function filterRecentArticles(articles: FeedArticle[], hours = 48): FeedArticle[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000
  return articles.filter((a) => {
    const pub = getArticlePublishedAt(a)
    if (!pub) return false
    const ts = new Date(pub).getTime()
    return !Number.isNaN(ts) && ts >= cutoff
  })
}

/** Google News sitemap XML with news:news tags */
export function generateGoogleNewsSitemap(opts: {
  siteUrl: string
  siteName: string
  language: string
  articles: FeedArticle[]
  includeAllArticles?: boolean
}): string {
  const { siteUrl, siteName, language, includeAllArticles = false } = opts
  const recent = filterRecentArticles(opts.articles, 48)
  const articles = includeAllArticles ? opts.articles : recent

  if (articles.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- No articles from the last 48 hours -->
</urlset>`
  }

  const urls = articles
    .map((article) => {
      const url = buildArticleUrl(siteUrl, article)
      const pubDate = getArticlePublishedAt(article)
      const pubIso = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
      const lastmod = toIsoDate(getArticleUpdatedAt(article))
      const title = escapeXml(article.title || article.slug)
      const isRecent = recent.some((r) => r.slug === article.slug)

      const newsBlock = isRecent
        ? `
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>${escapeXml(language)}</news:language>
      </news:publication>
      <news:publication_date>${pubIso}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>`
        : ''

      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>${newsBlock}
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`
}

import { fetchJSON } from '@/lib/remote'

export interface Article {
  id: string
  slug?: string
  title: string
  subtitle?: string | null
  excerpt?: string | null
  content?: string | null
  contentHtml?: string | null
  plainText?: string | null
  highlights?: string[] | null
  coverImage?: { url?: string | null; alt?: string | null; caption?: string | null } | null
  publishedAt?: string | null
  updatedAt?: string | null
  isBreaking?: boolean
  isLive?: boolean
  viewCount?: number
  shareCount?: number
  authors?: Array<{ id?: string; name?: string; role?: string }> | null
  categories?: Array<{ id?: string; name?: string; slug?: string }> | null
  tags?: string[] | null
  readingTimeMin?: number
  media?: {
    images?: Array<{ url?: string; alt?: string; caption?: string }> | null
    videos?: Array<{ url?: string; title?: string }> | null
  } | null
  // SEO fields from /articles/public/articles/{slug} API
  meta?: {
    seoTitle?: string
    metaDescription?: string
  }
  jsonLd?: {
    '@context'?: string
    '@type'?: string
    headline?: string
    description?: string
    image?: { '@type'?: string; url?: string }
    author?: { '@type'?: string; name?: string }
    publisher?: {
      '@type'?: string
      name?: string
      logo?: { '@type'?: string; url?: string; width?: number; height?: number }
    }
    datePublished?: string
    dateModified?: string
    url?: string
    mainEntityOfPage?: { '@type'?: string; '@id'?: string }
    keywords?: string[]
    inLanguage?: string
    isAccessibleForFree?: boolean
  }
  // Reporter information
  reporter?: {
    id?: string
    name?: string
    photoUrl?: string
    designation?: string
    location?: {
      state?: string
      district?: string
      mandal?: string
    }
    totalArticles?: number
    recentArticles?: Array<{
      id?: string
      slug?: string
      title?: string
      coverImageUrl?: string
      publishedAt?: string
      viewCount?: number
      category?: {
        slug?: string
        name?: string
      }
    }>
  } | null
  // Publisher information
  publisher?: {
    id?: string
    name?: string
    nativeName?: string
    publisherName?: string
    logoUrl?: string
  } | null
  // Must read article
  mustRead?: {
    id?: string
    slug?: string
    title?: string
    coverImageUrl?: string
    publishedAt?: string
    viewCount?: number
    category?: {
      slug?: string
      name?: string
    }
  } | null
  // Trending articles
  trending?: Array<{
    id?: string
    slug?: string
    title?: string
    coverImageUrl?: string
    publishedAt?: string
    viewCount?: number
    category?: {
      slug?: string
      name?: string
    }
  }> | null
  // Related articles
  related?: Array<{
    id?: string
    slug?: string
    title?: string
    coverImageUrl?: string
    publishedAt?: string
    viewCount?: number
  }> | null
  // Navigation
  previousArticle?: {
    id?: string
    slug?: string
    title?: string
    coverImageUrl?: string
  } | null
  nextArticle?: {
    id?: string
    slug?: string
    title?: string
    coverImageUrl?: string
  } | null
  [key: string]: unknown
}

export interface DataSource {
  homeFeed(tenantSlug: string, tenantId?: string): Promise<Article[]>
  articleBySlug(tenantSlug: string, slug: string, tenantId?: string): Promise<Article | null>
  articlesByCategory(tenantSlug: string, categorySlug: string, tenantId?: string): Promise<Article[]>
}

class RemoteDataSource implements DataSource {
  async homeFeed(_tenantSlug: string) {
    void _tenantSlug
    // Use paginated list endpoint from backend spec
    const pageSize = 12
    const res = await fetchJSON<unknown>(`/public/articles?page=1&pageSize=${pageSize}` , { tenantDomain: await currentDomain() })
    return normalizeList(res)
  }
  async articleBySlug(_tenantSlug: string, slug: string) {
    void _tenantSlug
    const domain = await currentDomain()
    
    // 🎯 PRIMARY: Use new detailed article API with all fields (mustRead, trending, related, etc.)
    // API: /public/articles/{slug}?languageCode=te
    const primaryPath = `/public/articles/${encodeURIComponent(slug)}?languageCode=te`
    
    try {
      const res = await fetchJSON<unknown>(primaryPath, { 
        tenantDomain: domain,
        revalidateSeconds: 60, // Cache article for 1 minute
      })
      
      if (res && typeof res === 'object') {
        return normalizeItem(res)
      }
    } catch (error) {
      console.log(`⚠️ Primary article API failed for slug "${slug}":`, error)
    }
    
    // FALLBACK: Try alternate endpoints
    const fallbackPaths = [
      `/public/articles/${encodeURIComponent(slug)}?domainName=${encodeURIComponent(domain)}`,
      `/public/articles?slug=${encodeURIComponent(slug)}&pageSize=1`,
      `/public/articles/${encodeURIComponent(slug)}`,
    ]
    
    for (const p of fallbackPaths) {
      try {
        const res = await fetchJSON<unknown>(p, { tenantDomain: domain })
        const list = normalizeList(res)
        if (list.length) return list[0]
        const obj = pickFirst(res, ['item', 'data', 'article']) ?? res
        return normalizeItem(obj)
      } catch {
        // continue to next fallback
      }
    }
    
    return null
  }
  async articlesByCategory(_tenantSlug: string, categorySlug: string) {
    void _tenantSlug
    const pageSize = 12
    const paths = [
      `/public/articles?category=${encodeURIComponent(categorySlug)}&page=1&pageSize=${pageSize}`,
      `/public/categories/${encodeURIComponent(categorySlug)}/articles?page=1&pageSize=${pageSize}`,
    ]
    for (const p of paths) {
      try {
        const res = await fetchJSON<unknown>(p, { tenantDomain: await currentDomain() })
        return normalizeList(res)
      } catch {
        // continue
      }
    }
    return []
  }
}

export function getDataSource(): DataSource {
  // This app is configured to use the remote backend API (API_BASE_URL).
  // Keep this function stable so callers don't change.
  return new RemoteDataSource()
}

function pickFirst(obj: unknown, keys: string[]) {
  if (obj && typeof obj === 'object') {
    for (const k of keys) {
      const v = (obj as Record<string, unknown>)[k]
      if (v !== undefined) return v
    }
  }
  return undefined
}

// Helper to extract category name from possibly nested object
function extractCategoryName(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    // If name is a string, return it
    if (obj.name && typeof obj.name === 'string') return obj.name
    // If name is itself an object (nested), extract from there
    if (obj.name && typeof obj.name === 'object') {
      const nested = obj.name as Record<string, unknown>
      if (nested.name && typeof nested.name === 'string') return nested.name
    }
    // Fallback to slug
    if (obj.slug && typeof obj.slug === 'string') return obj.slug
  }
  return String(val)
}

// Normalize category object to ensure name is always a string
function normalizeCategory(cat: unknown): { slug?: string; name?: string } | undefined {
  if (!cat || typeof cat !== 'object') return undefined
  const c = cat as Record<string, unknown>
  return {
    slug: typeof c.slug === 'string' ? c.slug : undefined,
    name: extractCategoryName(c.name || c)
  }
}

// Normalize nested article objects (mustRead, trending items, related items)
function normalizeNestedArticle(item: unknown): Record<string, unknown> | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const result: Record<string, unknown> = {
    id: o.id,
    slug: o.slug,
    title: o.title,
    coverImageUrl: o.coverImageUrl || o.image || o.imageUrl,
    publishedAt: o.publishedAt,
    viewCount: o.viewCount,
  }
  // Normalize category if present
  if (o.category) {
    result.category = normalizeCategory(o.category)
  }
  return result
}

function normalizeItem(u: unknown): Article {
  const o = (u ?? {}) as Record<string, unknown>
  const id = String(o.id ?? o._id ?? o.slug ?? cryptoRandom())
  const title = String(o.title ?? o.headline ?? 'Untitled')
  const slug = typeof o.slug === 'string' ? o.slug : undefined
  
  // Excerpt/Summary
  const excerpt = typeof o.excerpt === 'string' ? o.excerpt : (typeof o.summary === 'string' ? o.summary : (typeof o.subtitle === 'string' ? o.subtitle : undefined))
  
  // Subtitle
  const subtitle = typeof o.subtitle === 'string' ? o.subtitle : undefined
  
  // Highlights
  const highlights = Array.isArray(o.highlights) ? o.highlights as string[] : undefined
  
  // Content - prefer contentHtml, fallback to content or plainText
  const contentHtml = typeof o.contentHtml === 'string' ? o.contentHtml : undefined
  const content = typeof o.content === 'string' ? o.content : contentHtml
  const plainText = typeof o.plainText === 'string' ? o.plainText : undefined
  
  // Cover Image - support multiple field names and nested structures
  let coverUrl: string | undefined
  let coverAlt: string | undefined
  let coverCaption: string | undefined
  
  // First check coverImageUrl (used by new API)
  if (typeof o.coverImageUrl === 'string') coverUrl = o.coverImageUrl
  
  // Then check coverImage (string or object)
  if (!coverUrl && typeof o.coverImage === 'string') {
    coverUrl = o.coverImage
  } else if (!coverUrl && o.coverImage && typeof o.coverImage === 'object') {
    const ci = o.coverImage as Record<string, unknown>
    if (typeof ci.url === 'string') coverUrl = ci.url
    if (typeof ci.alt === 'string') coverAlt = ci.alt
    if (typeof ci.caption === 'string') coverCaption = ci.caption
  }
  
  if (!coverUrl && typeof o.image === 'string') coverUrl = o.image
  if (!coverUrl && o.image && typeof o.image === 'object') {
    const img = o.image as Record<string, unknown>
    if (typeof img.url === 'string') coverUrl = img.url
    if (!coverUrl && typeof img.src === 'string') coverUrl = img.src
  }
  if (!coverUrl && typeof o.imageUrl === 'string') coverUrl = o.imageUrl
  if (!coverUrl && typeof o.featuredImage === 'string') coverUrl = o.featuredImage
  if (!coverUrl && typeof o.thumbnail === 'string') coverUrl = o.thumbnail
  
  const normalizedCoverUrl = normalizeMediaUrl(coverUrl)
  
  // Published date
  const publishedAt = typeof o.publishedAt === 'string' ? o.publishedAt : (typeof o.createdAt === 'string' ? o.createdAt : undefined)
  
  // Updated date
  const updatedAt = o.audit && typeof o.audit === 'object' && typeof (o.audit as Record<string, unknown>).updatedAt === 'string'
    ? (o.audit as Record<string, unknown>).updatedAt as string
    : (typeof o.updatedAt === 'string' ? o.updatedAt : undefined)
  
  // Authors
  const authors = Array.isArray(o.authors) ? o.authors : undefined
  
  // Categories
  const categories = Array.isArray(o.categories) ? o.categories : undefined
  
  // Tags
  const tags = Array.isArray(o.tags) ? o.tags : undefined
  
  // Reading time
  const readingTimeMin = typeof o.readingTimeMin === 'number' ? o.readingTimeMin : undefined
  
  // SEO meta
  const meta = o.meta && typeof o.meta === 'object' ? o.meta as Article['meta'] : undefined
  
  // JSON-LD
  const jsonLd = o.jsonLd && typeof o.jsonLd === 'object' ? o.jsonLd as Article['jsonLd'] : undefined
  
  // Media (images and videos)
  const media = o.media && typeof o.media === 'object' ? o.media as Article['media'] : undefined
  
  // Breaking/Live status
  const isBreaking = typeof o.isBreaking === 'boolean' ? o.isBreaking : false
  const isLive = typeof o.isLive === 'boolean' ? o.isLive : false
  
  // View and share counts
  const viewCount = typeof o.viewCount === 'number' ? o.viewCount : 0
  const shareCount = typeof o.shareCount === 'number' ? o.shareCount : 0
  
  // Reporter information
  const reporter = o.reporter && typeof o.reporter === 'object' ? o.reporter as Article['reporter'] : null
  
  // Publisher information
  const publisher = o.publisher && typeof o.publisher === 'object' ? o.publisher as Article['publisher'] : null
  
  // Must read article - normalize to ensure category.name is a string
  const mustRead = o.mustRead && typeof o.mustRead === 'object' 
    ? normalizeNestedArticle(o.mustRead) as Article['mustRead'] 
    : null
  
  // Trending articles - normalize each item
  const trending = Array.isArray(o.trending) 
    ? o.trending.map(item => normalizeNestedArticle(item)).filter(Boolean) as Article['trending'] 
    : null
  
  // Related articles - normalize each item
  const related = Array.isArray(o.related) 
    ? o.related.map(item => normalizeNestedArticle(item)).filter(Boolean) as Article['related'] 
    : null
  
  // Navigation - previous and next articles
  const previousArticle = o.previousArticle && typeof o.previousArticle === 'object' ? o.previousArticle as Article['previousArticle'] : null
  const nextArticle = o.nextArticle && typeof o.nextArticle === 'object' ? o.nextArticle as Article['nextArticle'] : null
  
  return {
    id,
    slug,
    title,
    subtitle: subtitle ?? null,
    excerpt: excerpt ?? null,
    highlights: highlights ?? null,
    content: content ?? null,
    contentHtml: contentHtml ?? null,
    plainText: plainText ?? null,
    coverImage: normalizedCoverUrl ? {
      url: normalizedCoverUrl,
      alt: coverAlt ?? null,
      caption: coverCaption ?? null,
    } : undefined,
    publishedAt: publishedAt ?? null,
    updatedAt: updatedAt ?? null,
    authors: authors ?? null,
    categories: categories ?? null,
    tags: tags ?? null,
    readingTimeMin,
    meta,
    jsonLd,
    media,
    isBreaking,
    isLive,
    viewCount,
    shareCount,
    reporter,
    publisher,
    mustRead,
    trending,
    related,
    previousArticle,
    nextArticle,
  }
}

function normalizeList(u: unknown): Article[] {
  if (Array.isArray(u)) return u.map(normalizeItem)
  // Common API shapes:
  // - { items: [...] }
  // - { articles: [...] }
  // - { data: [...] }
  // - { data: { items: [...] } }
  // - { result: { items: [...] } }
  const direct = pickFirst(u, ['items', 'articles'])
  if (Array.isArray(direct)) return (direct as unknown[]).map(normalizeItem)

  const data = pickFirst(u, ['data', 'result'])
  if (Array.isArray(data)) return (data as unknown[]).map(normalizeItem)
  if (data && typeof data === 'object') {
    const nested = pickFirst(data, ['items', 'articles', 'data'])
    if (Array.isArray(nested)) return (nested as unknown[]).map(normalizeItem)
    if (nested && typeof nested === 'object') {
      const nested2 = pickFirst(nested, ['items', 'articles'])
      if (Array.isArray(nested2)) return (nested2 as unknown[]).map(normalizeItem)
    }
  }
  return []
}

function cryptoRandom() {
  // Fallback for environments without crypto.randomUUID
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  } catch {}
  return Math.random().toString(36).slice(2)
}

function normalizeMediaUrl(url?: string | null) {
  if (!url) return undefined
  const trimmed = String(url).trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`

  const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ''
  if (!base) return trimmed.startsWith('/') ? `https://app.kaburlumedia.com${trimmed}` : `https://app.kaburlumedia.com/${trimmed}`

  try {
    const origin = new URL(base).origin
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return `${origin}${path}`
  } catch {
    return trimmed
  }
}

async function currentDomain() {
  // ✅ ONLY read the custom header set by middleware
  // ❌ NEVER read Host header directly
  const { getTenantDomain } = await import('@/lib/domain-utils')
  return getTenantDomain()
}

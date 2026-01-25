import { fetchJSON } from '@/lib/remote'
import { headers } from 'next/headers'

export interface Article {
  id: string
  slug?: string
  title: string
  excerpt?: string | null
  content?: string | null
  contentHtml?: string | null
  plainText?: string | null
  coverImage?: { url?: string | null; alt?: string | null; caption?: string | null } | null
  publishedAt?: string | null
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
    
    // 🎯 PRIMARY: Use new detailed article API with SEO support
    const primaryPath = `/articles/public/articles/${encodeURIComponent(slug)}?domainName=${encodeURIComponent(domain)}`
    
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

function normalizeItem(u: unknown): Article {
  const o = (u ?? {}) as Record<string, unknown>
  const id = String(o.id ?? o._id ?? o.slug ?? cryptoRandom())
  const title = String(o.title ?? o.headline ?? 'Untitled')
  const slug = typeof o.slug === 'string' ? o.slug : undefined
  
  // Excerpt/Summary
  const excerpt = typeof o.excerpt === 'string' ? o.excerpt : (typeof o.summary === 'string' ? o.summary : (typeof o.subtitle === 'string' ? o.subtitle : undefined))
  
  // Content - prefer contentHtml, fallback to content or plainText
  const contentHtml = typeof o.contentHtml === 'string' ? o.contentHtml : undefined
  const content = typeof o.content === 'string' ? o.content : contentHtml
  const plainText = typeof o.plainText === 'string' ? o.plainText : undefined
  
  // Cover Image - support multiple field names and nested structures
  let coverUrl: string | undefined
  let coverAlt: string | undefined
  let coverCaption: string | undefined
  
  if (typeof o.coverImage === 'string') {
    coverUrl = o.coverImage
  } else if (o.coverImage && typeof o.coverImage === 'object') {
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
  
  return {
    id,
    slug,
    title,
    excerpt: excerpt ?? null,
    content: content ?? null,
    contentHtml: contentHtml ?? null,
    plainText: plainText ?? null,
    coverImage: normalizedCoverUrl ? {
      url: normalizedCoverUrl,
      alt: coverAlt ?? null,
      caption: coverCaption ?? null,
    } : undefined,
    publishedAt: publishedAt ?? null,
    authors: authors ?? null,
    categories: categories ?? null,
    tags: tags ?? null,
    readingTimeMin,
    meta,
    jsonLd,
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
  // 🎯 SIMPLE: If HOST env is set, use it directly
  if (process.env.HOST) {
    return process.env.HOST.split(':')[0]
  }
  try {
    const h = await headers()
    const host = h.get('host') || 'localhost'
    return host.split(':')[0]
  } catch {
    return 'localhost'
  }
}

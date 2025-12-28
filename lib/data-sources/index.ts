import { fetchJSON } from '@/lib/remote'
import { headers } from 'next/headers'

export interface Article {
  id: string
  slug?: string
  title: string
  excerpt?: string | null
  content?: string | null
  coverImage?: { url?: string | null } | null
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
    // Preferred: filter by slug; fallbacks included for flexibility
    const paths = [
      `/public/articles?slug=${encodeURIComponent(slug)}&pageSize=1`,
      `/public/articles/by-slug?slug=${encodeURIComponent(slug)}`,
      `/public/articles/${encodeURIComponent(slug)}`,
      `/public/article/${encodeURIComponent(slug)}`,
    ]
    for (const p of paths) {
      try {
        const res = await fetchJSON<unknown>(p, { tenantDomain: await currentDomain() })
        const list = normalizeList(res)
        if (list.length) return list[0]
        const obj = pickFirst(res, ['item', 'data', 'article']) ?? res
        return normalizeItem(obj)
      } catch {
        // continue
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
  const excerpt = typeof o.excerpt === 'string' ? o.excerpt : (typeof o.summary === 'string' ? o.summary : undefined)
  const content = typeof o.content === 'string' ? o.content : undefined
  let coverUrl: string | undefined
  if (typeof o.coverImage === 'string') coverUrl = o.coverImage
  if (!coverUrl && o.coverImage && typeof o.coverImage === 'object') {
    const ci = o.coverImage as Record<string, unknown>
    if (typeof ci.url === 'string') coverUrl = ci.url
  }
  if (!coverUrl && typeof o.imageUrl === 'string') coverUrl = o.imageUrl
  if (!coverUrl && typeof o.featuredImage === 'string') coverUrl = o.featuredImage
  return { id, slug, title, excerpt: excerpt ?? null, content: content ?? null, coverImage: coverUrl ? { url: coverUrl } : undefined }
}

function normalizeList(u: unknown): Article[] {
  if (Array.isArray(u)) return u.map(normalizeItem)
  const arr = pickFirst(u, ['items', 'data', 'articles'])
  if (Array.isArray(arr)) return (arr as unknown[]).map(normalizeItem)
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

async function currentDomain() {
  try {
    const h = await headers()
    const host = h.get('host') || 'localhost'
    return host.split(':')[0]
  } catch {
    return 'localhost'
  }
}

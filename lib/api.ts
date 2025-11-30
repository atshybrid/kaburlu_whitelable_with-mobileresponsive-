export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1'

export async function fetchJSON(url:string, opts:RequestInit={}) {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error('Fetch error: ' + res.status)
  return res.json()
}

// Short News API (public)
// Ensure SHORT_NEWS_API always ends with /shortnews/public so callers can just set base API origin
const RAW_SHORT_NEWS = process.env.NEXT_PUBLIC_SHORT_NEWS_API || 'https://app.humanrightscouncilforindia.org/api/v1/shortnews/public'
export const SHORT_NEWS_API = /\/shortnews\/public\/?$/.test(RAW_SHORT_NEWS)
  ? RAW_SHORT_NEWS.replace(/\/$/, '')
  : RAW_SHORT_NEWS.replace(/\/$/, '') + '/shortnews/public'

export type ShortNewsItem = {
  kind: 'news'
  data: {
    id: string
    title: string
    slug: string | null
    summary: string | null
    content: string | null
    categoryName?: string | null
    primaryImageUrl?: string | null
    canonicalUrl?: string | null
    notifiedAt?: string | null
    publishedAt?: string | null
    languageCode?: string | null
  }
}

export type ShortNewsResponse = {
  success: boolean
  pageInfo: {
    limit: number
    nextCursor?: string
    hasMore: boolean
  }
  data: ShortNewsItem[]
}

export async function fetchShortNews(params: { limit?: number; cursor?: string; signal?: AbortSignal; revalidate?: number; tags?: string[] }): Promise<ShortNewsResponse> {
  const { limit = 30, cursor, signal, revalidate = 120, tags } = params || {}
  const url = new URL(SHORT_NEWS_API)
  url.searchParams.set('limit', String(limit))
  if (cursor) url.searchParams.set('cursor', cursor)
  const res = await fetch(url.toString(), {
    headers: { accept: 'application/json' },
    signal,
    next: { revalidate, tags },
  })
  if (res.status === 401) {
    // Treat auth failure as empty public feed; do not throw to avoid build/dev overlays
    return {
      success: false,
      pageInfo: { limit, hasMore: false },
      data: [],
    }
  }
  if (!res.ok) throw new Error(`ShortNews fetch failed: ${res.status}`)
  return res.json() as Promise<ShortNewsResponse>
}

export type NormalizedShortArticle = {
  id: string
  title: string
  href: string // external or internal URL to view the item
  image?: string | null
  category?: string | null
  publishedAt?: string | null
  summary?: string | null
  alt?: string | null
}

export function normalizeShortNews(items: ShortNewsItem[]): NormalizedShortArticle[] {
  return items.map(it => {
    const d = it.data
    // Prefer internal detail page by ID so we can always fetch the item reliably
    const href = (d.id ? `/short/${d.id}` : (d.slug ? `/short/${d.slug}` : (d.canonicalUrl || '#')))
    const alt = (d as any)?.seo?.altTexts?.[d.primaryImageUrl || ''] || null
    return {
      id: d.id,
      title: d.title,
      href,
      image: d.primaryImageUrl || null,
      category: d.categoryName || null,
      publishedAt: d.publishedAt || d.notifiedAt || null,
      summary: d.summary || null,
      alt,
    }
  })
}

export function groupByCategory(items: NormalizedShortArticle[]): Record<string, NormalizedShortArticle[]> {
  return items.reduce((acc, a) => {
    const key = a.category || 'Misc'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {} as Record<string, NormalizedShortArticle[]>)
}

// Safe helper to fetch and normalize with grouping, with error tolerance
export async function getShortNewsNormalized(opts?: { limit?: number; cursor?: string; revalidate?: number; tags?: string[] }) {
  try {
    const res = await fetchShortNews({ limit: opts?.limit ?? 60, cursor: opts?.cursor, revalidate: opts?.revalidate ?? 120, tags: opts?.tags })
    const items = normalizeShortNews(res.data)
    const grouped = groupByCategory(items)
    return { items, grouped, pageInfo: res.pageInfo }
  } catch (e) {
    console.error('[ShortNews] fetch failed', e)
    return { items: [] as NormalizedShortArticle[], grouped: {} as Record<string, NormalizedShortArticle[]>, pageInfo: { limit: opts?.limit ?? 60, hasMore: false } }
  }
}

// Single short news detail
export type ShortNewsDetail = {
  id: string
  title: string
  slug: string | null
  summary: string | null
  content: string | null
  categoryName?: string | null
  primaryImageUrl?: string | null
  canonicalUrl?: string | null
  publishedAt?: string | null
  notifiedAt?: string | null
  languageName?: string | null
  languageCode?: string | null
  authorName?: string | null
  tags?: string[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    altTexts?: Record<string, string>
    jsonLd?: any
  }
}

export async function fetchShortNewsItem(params: { id: string; languageId?: string; revalidate?: number; tags?: string[] }): Promise<{ success: boolean; data: ShortNewsDetail | null }> {
  const { id, languageId, revalidate = 120, tags } = params
  const base = SHORT_NEWS_API.replace(/\/?$/, '')
  const url = new URL(`${base}/${id}`)
  if (languageId) url.searchParams.set('languageId', languageId)
  const res = await fetch(url.toString(), {
    headers: { accept: 'application/json' },
    next: { revalidate, tags },
  })
  if (!res.ok) return { success: false, data: null }
  const json = await res.json()
  return { success: !!json?.success, data: json?.data || null }
}

import { headers } from 'next/headers'
import { fetchJSON } from './remote'
import type { Article } from './data-sources'
import { cache as reactCache } from 'react'

export type PublicHomepageSection = {
  id: string
  type: string
  label?: string
  ui?: Record<string, unknown>
  query?: Record<string, unknown>
}

export type PublicHomepageResponse = {
  version: string
  tenant?: { id: string; slug: string; name: string }
  theme?: { key: string }
  uiTokens?: Record<string, unknown>
  sections: PublicHomepageSection[]
  data: Record<string, Article[]>
}

// ---- NEW: Actual API response structure ----

export type HomepageFeedItem = {
  id: string
  slug?: string
  title: string
  excerpt?: string | null
  content?: string | null
  image?: string | null
  coverImage?: string | null
  coverImageUrl?: string | null
  publishedAt?: string | null
  createdAt?: string | null
  category?: unknown
  tags?: unknown[]
  languageCode?: string | null
}

export type HomepageFeed = {
  kind: string
  limit?: number
  metric?: string
  items: HomepageFeedItem[]
}

export type HomepageCategoryFeedItem = {
  category: {
    slug: string
    name: string
    href: string
  }
  items: HomepageFeedItem[]
  message?: string
}

export type HomepageCategoriesFeed = {
  kind: 'categories'
  perCategoryLimit: number
  items: HomepageCategoryFeedItem[]
}

export type HomepageFeeds = {
  latest?: HomepageFeed
  mostRead?: HomepageFeed
  ticker?: HomepageFeed
  breaking?: HomepageFeed
  categories?: HomepageCategoriesFeed
}

export type NewHomepageResponse = {
  version: string
  tenant?: {
    id: string
    slug: string
    name: string
    nativeName?: string
    language?: {
      code: string
      name: string
    }
  }
  theme?: {
    key: string
  }
  feeds: HomepageFeeds
}

// ---- Style2 "shape" homepage (legacy/alternate backend contract) ----

export type Style2HomepageItem = {
  id: string
  slug?: string
  title: string
  image?: string | null
  excerpt?: string | null
  category?: unknown
  publishedAt?: string | null
  tags?: unknown[]
  languageCode?: string | null
}

export type Style2HomepageSection = {
  key: string
  title: string
  position: number
  style?: string
  limit?: number
  categorySlug?: string | null
  items?: Style2HomepageItem[]
}

export type Style2HomepageResponse = {
  hero?: Style2HomepageItem[]
  topStories?: Style2HomepageItem[]
  sections?: Style2HomepageSection[]
  config?: unknown
  // Backend may also return per-section arrays keyed by section.key
  [key: string]: unknown
}

function normalizeStyle2HomepageResponse(u: unknown): Style2HomepageResponse {
  if (!u || typeof u !== 'object') return {}
  const o = u as Record<string, unknown>
  const hero = o['hero']
  const topStories = o['topStories']
  const sections = o['sections']
  if (Array.isArray(hero) || Array.isArray(topStories) || Array.isArray(sections)) return o as Style2HomepageResponse

  const data = o['data']
  if (data && typeof data === 'object') return normalizeStyle2HomepageResponse(data)
  const result = o['result']
  if (result && typeof result === 'object') return normalizeStyle2HomepageResponse(result)
  return o as Style2HomepageResponse
}

function domainFromHost(host: string | null) {
  const h = (host || 'localhost').split(':')[0]
  return h || 'localhost'
}

function domainFromHeaders(h: Headers, override?: string) {
  const explicit = String(override || '').trim()
  if (explicit) return domainFromHost(explicit)
  const fromHeader = String(h.get('x-tenant-domain') || '').trim()
  if (fromHeader) return domainFromHost(fromHeader)
  return domainFromHost(h.get('host'))
}

export async function getPublicHomepage(params: {
  v?: string | number
  themeKey?: string
  lang?: string
}): Promise<NewHomepageResponse> {
  return _getPublicHomepage(params)
}

export async function getPublicHomepageForDomain(tenantDomain: string, params: {
  v?: string | number
  themeKey?: string
  lang?: string
}): Promise<NewHomepageResponse> {
  return _getPublicHomepageForDomain(tenantDomain, params)
}

export async function getPublicHomepageStyle2Shape(): Promise<Style2HomepageResponse> {
  return _getPublicHomepageStyle2Shape(undefined)
}

export async function getPublicHomepageStyle2ShapeForDomain(tenantDomain: string): Promise<Style2HomepageResponse> {
  return _getPublicHomepageStyle2Shape(tenantDomain)
}

const _getPublicHomepage = reactCache(async (params: {
  v?: string | number
  themeKey?: string
  lang?: string
}): Promise<NewHomepageResponse> => {
  const h = await headers()
  const domain = domainFromHost(h.get('host'))
  const lang = String(params.lang || 'en')
  const themeKey = String(params.themeKey || 'style1')

  // Backend contract: GET /public/homepage?v=1 (optional lang/themeKey).
  // Domain is inferred via X-Tenant-Domain header.
  const qs = new URLSearchParams({ v: String(params.v ?? '1') })
  if (lang) qs.set('lang', lang)
  if (themeKey) qs.set('themeKey', themeKey)

  return fetchJSON<NewHomepageResponse>(`/public/homepage?${qs.toString()}`, {
    tenantDomain: domain,
    // Cache with revalidation; avoids repeated backend hits.
    revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
    tags: [`homepage:${domain}:${lang}:${themeKey}`],
  })
})

const _getPublicHomepageForDomain = reactCache(async (tenantDomain: string, params: {
  v?: string | number
  themeKey?: string
  lang?: string
}): Promise<NewHomepageResponse> => {
  const lang = String(params.lang || 'en')
  const themeKey = String(params.themeKey || 'style1')

  // Backend contract: GET /public/homepage?v=1 (optional lang/themeKey).
  // Domain is inferred via X-Tenant-Domain header.
  const qs = new URLSearchParams({ v: String(params.v ?? '1') })
  if (lang) qs.set('lang', lang)
  if (themeKey) qs.set('themeKey', themeKey)

  return fetchJSON<NewHomepageResponse>(`/public/homepage?${qs.toString()}`, {
    tenantDomain: domainFromHost(tenantDomain),
    // Cache with revalidation; avoids repeated backend hits.
    revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
    tags: [`homepage:${tenantDomain}:${lang}:${themeKey}`],
  })
})

const _getPublicHomepageStyle2Shape = reactCache(async (tenantDomainOverride?: string): Promise<Style2HomepageResponse> => {
  const h = await headers()
  const domain = domainFromHeaders(h, tenantDomainOverride)

  // Backend contract: GET /public/homepage?domain=<domain>&shape=style2
  // Still send X-Tenant-Domain via fetchJSON.
  const qs = new URLSearchParams({ domain, shape: 'style2' })

  const res = await fetchJSON<unknown>(`/public/homepage?${qs.toString()}`, {
    tenantDomain: domain,
    revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
    tags: [`homepage:${domain}:shape:style2`],
  })

  return normalizeStyle2HomepageResponse(res)
})

// ---- Helper to convert feed items to Article format ----

export function feedItemToArticle(item: HomepageFeedItem): Article {
  const coverUrl = item.image || item.coverImageUrl || item.coverImage || undefined
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    excerpt: item.excerpt || null,
    content: item.content || null,
    coverImage: coverUrl ? { url: coverUrl } : undefined,
    publishedAt: item.publishedAt || item.createdAt || undefined,
  } as Article
}

export function feedItemsToArticles(items: HomepageFeedItem[]): Article[] {
  return items.map(feedItemToArticle)
}

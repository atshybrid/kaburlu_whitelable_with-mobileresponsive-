import { headers } from 'next/headers'
import { fetchJSON } from './remote'
import type { Article } from './data-sources'
import { cache as reactCache } from 'react'
import { isWrongTenantData, getFallbackArticles, getFallbackCategories } from './fallback-data'

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

// ---- NEW: /public/articles/home?shape=homepage response structure ----

export type HomepageShapedArticle = {
  id: string
  slug?: string
  title: string
  excerpt?: string | null
  coverImageUrl?: string | null
  image?: string | null
  publishedAt?: string | null
  category?: {
    id?: string
    slug?: string
    name?: string
  }
  tags?: string[]
  languageCode?: string | null
}

export type HomepageShapedSection = {
  key: string
  title: string
  position: number
  limit?: number
  categorySlug?: string | null
  items: HomepageShapedArticle[]
}

export type HomepageShapedResponse = {
  hero?: HomepageShapedArticle[]
  topStories?: HomepageShapedArticle[]
  sections?: HomepageShapedSection[]
  data?: Record<string, HomepageShapedArticle[]>
  config?: {
    heroCount?: number
    topStoriesCount?: number
    themeKey?: string
    lang?: string
  }
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

  try {
    const response = await fetchJSON<NewHomepageResponse>(`/public/homepage?${qs.toString()}`, {
      tenantDomain: domain,
      // Cache with revalidation; avoids repeated backend hits.
      revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
      tags: [`homepage:${domain}:${lang}:${themeKey}`],
    })

    // Check if we got wrong tenant data (e.g., Crown Human Rights)
    if (isWrongTenantData(response)) {
      console.warn('⚠️ Wrong tenant data detected, using fallback Telugu articles')
      return await createFallbackHomepageResponse(lang, themeKey)
    }

    return response
  } catch (error) {
    console.error('❌ Homepage API failed, using fallback Telugu articles:', error)
    return await createFallbackHomepageResponse(lang, themeKey)
  }
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

// ---- NEW: Get homepage with shape=homepage (structured sections) ----

export async function getHomepageShaped(params?: {
  themeKey?: string
  lang?: string
}): Promise<HomepageShapedResponse> {
  return _getHomepageShaped(params)
}

export async function getHomepageShapedForDomain(tenantDomain: string, params?: {
  themeKey?: string
  lang?: string
}): Promise<HomepageShapedResponse> {
  return _getHomepageShapedForDomain(tenantDomain, params)
}

const _getHomepageShaped = reactCache(async (params?: {
  themeKey?: string
  lang?: string
}): Promise<HomepageShapedResponse> => {
  const h = await headers()
  const domain = domainFromHost(h.get('host'))
  const lang = String(params?.lang || 'te')
  const themeKey = String(params?.themeKey || 'style1')

  // Backend contract: GET /public/articles/home?shape=homepage&themeKey=style1&lang=te
  const qs = new URLSearchParams({
    shape: 'homepage',
    themeKey,
    lang,
  })

  try {
    const response = await fetchJSON<HomepageShapedResponse>(`/public/articles/home?${qs.toString()}`, {
      tenantDomain: domain,
      revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
      tags: [`homepage:shaped:${domain}:${lang}:${themeKey}`],
    })

    // Check if we got wrong tenant data
    if (isWrongTenantData(response)) {
      console.warn('⚠️ Wrong tenant data detected in shaped homepage, using fallback')
      return await createFallbackShapedHomepage(lang, themeKey)
    }

    return response
  } catch (error) {
    console.error('❌ Shaped homepage API failed, using fallback:', error)
    return await createFallbackShapedHomepage(lang, themeKey)
  }
})

const _getHomepageShapedForDomain = reactCache(async (tenantDomain: string, params?: {
  themeKey?: string
  lang?: string
}): Promise<HomepageShapedResponse> => {
  const lang = String(params?.lang || 'te')
  const themeKey = String(params?.themeKey || 'style1')

  const qs = new URLSearchParams({
    shape: 'homepage',
    themeKey,
    lang,
  })

  try {
    const response = await fetchJSON<HomepageShapedResponse>(`/public/articles/home?${qs.toString()}`, {
      tenantDomain: domainFromHost(tenantDomain),
      revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
      tags: [`homepage:shaped:${tenantDomain}:${lang}:${themeKey}`],
    })

    if (isWrongTenantData(response)) {
      console.warn('⚠️ Wrong tenant data detected in shaped homepage, using fallback')
      return await createFallbackShapedHomepage(lang, themeKey)
    }

    return response
  } catch (error) {
    console.error('❌ Shaped homepage API failed, using fallback:', error)
    return await createFallbackShapedHomepage(lang, themeKey)
  }
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

// ---- Fallback homepage response ----

async function createFallbackHomepageResponse(lang: string, themeKey: string): Promise<NewHomepageResponse> {
  const articles = await getFallbackArticles()
  const categories = await getFallbackCategories()

  // Create feeds with fallback data - fill ALL sections completely
  const latestItems = articles.slice(0, 20).map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    image: a.imageUrl,
    coverImageUrl: a.imageUrl,
    publishedAt: a.publishedAt,
    category: a.category,
  }))

  // Create ticker items
  const tickerItems = articles.slice(0, 8).map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
  }))

  // Create category feeds with MORE articles per category
  const categoryFeeds = categories.slice(0, 8).map(cat => {
    // Get articles for this category, or use general articles if none found
    const categoryArticles = articles.filter(a => a.category?.slug === cat.slug)
    const articlesToUse = categoryArticles.length > 0 ? categoryArticles : articles
    
    return {
      category: {
        slug: cat.slug,
        name: cat.name,
        href: `/category/${cat.slug}`,
      },
      items: articlesToUse.slice(0, 8).map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        image: a.imageUrl,
        publishedAt: a.publishedAt,
        category: a.category,
      })),
    }
  })

  // Create mostRead items
  const mostReadItems = articles.slice(0, 6).map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    image: a.imageUrl,
    publishedAt: a.publishedAt,
  }))

  return {
    version: '1',
    tenant: {
      id: 'fallback',
      slug: 'demo',
      name: 'కబుర్లు డెమో',
      nativeName: 'కబుర్లు',
      language: { code: lang, name: 'తెలుగు' },
    },
    theme: { key: themeKey },
    feeds: {
      latest: { kind: 'latest', items: latestItems },
      ticker: { kind: 'ticker', items: tickerItems },
      mostRead: { kind: 'mostRead', items: mostReadItems },
      categories: {
        kind: 'categories',
        perCategoryLimit: 8,
        items: categoryFeeds,
      },
    },
  }
}

// ---- Fallback shaped homepage response ----

async function createFallbackShapedHomepage(lang: string, themeKey: string): Promise<HomepageShapedResponse> {
  const articles = await getFallbackArticles()
  const categories = await getFallbackCategories()

  // Convert fallback articles to shaped format
  const shapedArticles: HomepageShapedArticle[] = articles.map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverImageUrl: a.imageUrl,
    publishedAt: a.publishedAt,
    category: a.category ? {
      id: a.category.id,
      slug: a.category.slug,
      name: a.category.name,
    } : undefined,
    tags: [], // Fallback articles don't have tags
    languageCode: lang,
  }))

  // Hero: 1 article
  const hero = shapedArticles.slice(0, 1)
  
  // Top Stories: 5 articles
  const topStories = shapedArticles.slice(1, 6)

  // Create sections for specific categories
  const sections: HomepageShapedSection[] = []
  const sectionData: Record<string, HomepageShapedArticle[]> = {}

  // Define priority categories
  const priorityCategories = ['latest', 'entertainment', 'politics', 'breaking', 'sports', 'business']
  
  priorityCategories.forEach((catSlug, index) => {
    const category = categories.find(c => c.slug === catSlug)
    if (!category) return

    // Get articles for this category
    const categoryArticles = shapedArticles.filter(a => a.category?.slug === catSlug)
    const articlesToUse = categoryArticles.length > 0 ? categoryArticles : shapedArticles.slice(index * 6, (index + 1) * 6)

    const section: HomepageShapedSection = {
      key: catSlug,
      title: category.name,
      position: index + 1,
      limit: 6,
      categorySlug: catSlug,
      items: articlesToUse.slice(0, 6),
    }

    sections.push(section)
    sectionData[catSlug] = articlesToUse.slice(0, 6)
  })

  return {
    hero,
    topStories,
    sections,
    data: sectionData,
    config: {
      heroCount: 1,
      topStoriesCount: 5,
      themeKey,
      lang,
    },
  }
}

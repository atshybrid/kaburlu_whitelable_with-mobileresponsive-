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
  coverImage?: string | null
  coverImageUrl?: string | null
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

// ============================================
// 🚀 NEW: /public/homepage/smart (2026) response
// Single call: config + seo + sections (ticker/hero/categories/etc)
// ============================================

export type HomepageSmartV2Article = {
  id: string
  slug: string
  title: string
  coverImageUrl?: string | null
  publishedAt?: string | null
  viewCount?: number | null
  category?: {
    id?: string
    slug?: string
    name?: string
  } | null
}

export type HomepageSmartV2HeroColumn = {
  key: string
  position?: number
  name?: string
  limit?: number
  articles: HomepageSmartV2Article[]
}

export type HomepageSmartV2SectionTicker = {
  id: string
  key: 'ticker' | string
  name?: string
  visible: boolean
  limit?: number
  articles: HomepageSmartV2Article[]
}

export type HomepageSmartV2SectionHero = {
  id: string
  key: 'hero' | string
  name?: string
  visible: boolean
  totalArticles?: number
  columns: HomepageSmartV2HeroColumn[]
}

export type HomepageSmartV2CategoryBlock = {
  slug: string
  name: string
  visible: boolean
  articlesLimit?: number
  articles: HomepageSmartV2Article[]
}

export type HomepageSmartV2SectionCategories = {
  id: string
  key: 'categories' | string
  name?: string
  visible: boolean
  categoriesShown?: number
  maxCategories?: number
  articlesPerCategory?: number
  totalArticles?: number
  categories: HomepageSmartV2CategoryBlock[]
}

export type HomepageSmartV2SectionHgBlock = {
  id: string
  key: 'hgBlock' | string
  name?: string
  visible: boolean
  categoriesShown?: number
  maxCategories?: number
  articlesPerCategory?: number
  totalArticles?: number
  categories: HomepageSmartV2CategoryBlock[]
}

export type HomepageSmartV2Section =
  | HomepageSmartV2SectionTicker
  | HomepageSmartV2SectionHero
  | HomepageSmartV2SectionCategories
  | HomepageSmartV2SectionHgBlock
  | {
      id: string
      key: string
      name?: string
      visible: boolean
      [key: string]: unknown
    }

export type HomepageSmartV2Response = {
  config?: {
    themeStyle?: string
    detectedFromDomain?: string
    sortBy?: string
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string | null
    ogImageUrl?: string
    ogUrl?: string
    jsonLd?: unknown
  }
  sections: HomepageSmartV2Section[]
  meta?: {
    timestamp?: string
    totalSections?: number
    visibleSections?: number
    [key: string]: unknown
  }
}

export type HomepageSmartV2Params = {
  lang?: string
  sortBy?: string
}

export async function getHomepageSmartV2(params?: HomepageSmartV2Params): Promise<HomepageSmartV2Response> {
  return _getHomepageSmartV2(params)
}

export async function getHomepageSmartV2ForDomain(
  tenantDomain: string,
  params?: HomepageSmartV2Params,
): Promise<HomepageSmartV2Response> {
  return _getHomepageSmartV2ForDomain(tenantDomain, params)
}

const _getHomepageSmartV2 = reactCache(async (params?: HomepageSmartV2Params): Promise<HomepageSmartV2Response> => {
  const h = await headers()
  const domain = domainFromHeaders(h)
  const lang = params?.lang || 'te'
  const sortBy = params?.sortBy || 'publishedAt'
  const qs = new URLSearchParams({ lang, sortBy })

  return fetchJSON<HomepageSmartV2Response>(`/public/homepage/smart?${qs.toString()}`, {
    tenantDomain: domain,
    revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
    tags: [`homepage-smart-v2:${domain}:${lang}:${sortBy}`],
  })
})

const _getHomepageSmartV2ForDomain = reactCache(
  async (tenantDomain: string, params?: HomepageSmartV2Params): Promise<HomepageSmartV2Response> => {
    const lang = params?.lang || 'te'
    const sortBy = params?.sortBy || 'publishedAt'
    const qs = new URLSearchParams({ lang, sortBy })

    return fetchJSON<HomepageSmartV2Response>(`/public/homepage/smart?${qs.toString()}`, {
      tenantDomain: domainFromHost(tenantDomain),
      revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
      tags: [`homepage-smart-v2:${tenantDomain}:${lang}:${sortBy}`],
    })
  },
)

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
  // 🎯 SIMPLE: If HOST env is set, use it directly
  if (process.env.HOST) {
    return process.env.HOST.split(':')[0]
  }
  const h = (host || 'localhost').split(':')[0]
  return h || 'localhost'
}

// ============================================
// 🚀 SMART HOMEPAGE API - Best Practice Implementation
// Single optimized API call instead of multiple calls
// ============================================

export type SmartHomepageParams = {
  latestCount?: number
  mostReadCount?: number
  sectionsCount?: number
  articlesPerSection?: number
  lang?: string
  themeKey?: string
}

// Matches backend response structure exactly
export type SmartHomepageArticle = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  imageUrl?: string | null
  categoryId?: string
  categoryName?: string
  categorySlug?: string
  publishedAt?: string | null
  readTime?: number
  viewCount?: number
  isBreaking?: boolean
}

export type SmartHomepageTickerItem = {
  id: string
  title: string
  slug: string
  categorySlug?: string
  publishedAt?: string | null
  isBreaking?: boolean
}

export type SmartHomepageSection = {
  categoryId?: string
  categoryName: string
  categorySlug: string
  categoryIcon?: string
  articlesCount?: number
  articles: SmartHomepageArticle[]
}

export type SmartHomepageMeta = {
  totalArticles?: number
  totalCategories?: number
  lastUpdated?: string
  cacheAge?: number
  // Legacy fields for compatibility
  tenant?: {
    id?: string
    slug?: string
    name?: string
    nativeName?: string
  }
  theme?: {
    key?: string
  }
  lang?: string
  generatedAt?: string
}

export type SmartHomepageResponse = {
  version?: string
  timestamp?: string
  ticker: SmartHomepageTickerItem[]
  latestNews: SmartHomepageArticle[]
  mostRead: SmartHomepageArticle[]
  sections: SmartHomepageSection[]
  meta: SmartHomepageMeta
}

/**
 * 🚀 getSmartHomepage - Single optimized API call for homepage data
 * 
 * Best Practice Benefits:
 * - 1 API call instead of 4 parallel calls
 * - Faster TTFB (Time to First Byte)
 * - Single cache entry = simpler invalidation
 * - Better error handling with automatic fallback
 * 
 * @param params - Configuration for homepage data
 * @returns SmartHomepageResponse with all required data
 */
export async function getSmartHomepage(params?: SmartHomepageParams): Promise<SmartHomepageResponse> {
  return _getSmartHomepage(params)
}

export async function getSmartHomepageForDomain(tenantDomain: string, params?: SmartHomepageParams): Promise<SmartHomepageResponse> {
  return _getSmartHomepageForDomain(tenantDomain, params)
}

const _getSmartHomepage = reactCache(async (params?: SmartHomepageParams): Promise<SmartHomepageResponse> => {
  const h = await headers()
  const domain = domainFromHeaders(h)
  
  const latestCount = params?.latestCount || 12
  const mostReadCount = params?.mostReadCount || 8
  const sectionsCount = params?.sectionsCount || 6
  const articlesPerSection = params?.articlesPerSection || 4
  const lang = params?.lang || 'te'
  const themeKey = params?.themeKey || 'style1'

  const qs = new URLSearchParams({
    latestCount: String(latestCount),
    mostReadCount: String(mostReadCount),
    sectionsCount: String(sectionsCount),
    articlesPerSection: String(articlesPerSection),
    lang,
    themeKey,
  })

  try {
    const response = await fetchJSON<SmartHomepageResponse>(`/public/smart-homepage?${qs.toString()}`, {
      tenantDomain: domain,
      revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
      tags: [`smart-homepage:${domain}:${lang}:${themeKey}`],
    })

    // Validate response has required data
    if (!response || (!response.latestNews?.length && !response.sections?.length)) {
      console.warn('⚠️ Smart homepage returned empty data, using fallback')
      return await createSmartHomepageFallback(params)
    }

    // Check for wrong tenant data
    if (isWrongTenantData(response)) {
      console.warn('⚠️ Wrong tenant data detected in smart homepage, using fallback')
      return await createSmartHomepageFallback(params)
    }

    return response
  } catch (error) {
    console.error('❌ Smart homepage API failed, using fallback:', error)
    return await createSmartHomepageFallback(params)
  }
})

const _getSmartHomepageForDomain = reactCache(async (tenantDomain: string, params?: SmartHomepageParams): Promise<SmartHomepageResponse> => {
  const latestCount = params?.latestCount || 12
  const mostReadCount = params?.mostReadCount || 8
  const sectionsCount = params?.sectionsCount || 6
  const articlesPerSection = params?.articlesPerSection || 4
  const lang = params?.lang || 'te'
  const themeKey = params?.themeKey || 'style1'

  const qs = new URLSearchParams({
    latestCount: String(latestCount),
    mostReadCount: String(mostReadCount),
    sectionsCount: String(sectionsCount),
    articlesPerSection: String(articlesPerSection),
    lang,
    themeKey,
  })

  try {
    const response = await fetchJSON<SmartHomepageResponse>(`/public/smart-homepage?${qs.toString()}`, {
      tenantDomain: domainFromHost(tenantDomain),
      revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
      tags: [`smart-homepage:${tenantDomain}:${lang}:${themeKey}`],
    })

    if (!response || (!response.latestNews?.length && !response.sections?.length)) {
      console.warn('⚠️ Smart homepage returned empty data, using fallback')
      return await createSmartHomepageFallback(params)
    }

    if (isWrongTenantData(response)) {
      console.warn('⚠️ Wrong tenant data detected in smart homepage, using fallback')
      return await createSmartHomepageFallback(params)
    }

    return response
  } catch (error) {
    console.error('❌ Smart homepage API failed for domain, using fallback:', error)
    return await createSmartHomepageFallback(params)
  }
})

/**
 * Creates fallback response when smart-homepage API is unavailable
 * Uses existing homepage APIs as fallback source
 */
async function createSmartHomepageFallback(params?: SmartHomepageParams): Promise<SmartHomepageResponse> {
  const lang = params?.lang || 'te'
  const themeKey = params?.themeKey || 'style1'
  
  try {
    // Try to get data from existing APIs
    const [shapedResult, homepageResult] = await Promise.all([
      getHomepageShaped({ themeKey, lang }).catch(() => null),
      getPublicHomepage({ v: 1, themeKey, lang }).catch(() => null),
    ])

    const shaped = shapedResult
    const homepage = homepageResult

    // Build smart homepage from existing data
    const latestNews: SmartHomepageArticle[] = []
    const mostRead: SmartHomepageArticle[] = []
    const ticker: SmartHomepageTickerItem[] = []
    const sections: SmartHomepageSection[] = []

    // Helper to convert shaped article to smart article
    const toSmartArticle = (a: HomepageShapedArticle): SmartHomepageArticle => ({
      id: a.id,
      title: a.title,
      slug: a.slug || a.id,
      excerpt: a.excerpt,
      imageUrl: a.coverImageUrl || a.image,
      categorySlug: a.category?.slug,
      categoryName: a.category?.name,
      publishedAt: a.publishedAt,
    })

    // Helper to convert to ticker item
    const toTickerItem = (a: HomepageShapedArticle): SmartHomepageTickerItem => ({
      id: a.id,
      title: a.title,
      slug: a.slug || a.id,
      categorySlug: a.category?.slug,
      publishedAt: a.publishedAt,
    })

    // Extract from shaped homepage
    if (shaped) {
      if (shaped.hero) latestNews.push(...shaped.hero.map(toSmartArticle))
      if (shaped.topStories) latestNews.push(...shaped.topStories.map(toSmartArticle))
      
      if (shaped.sections) {
        shaped.sections.forEach(s => {
          sections.push({
            categorySlug: s.categorySlug || s.key,
            categoryName: s.title,
            articles: s.items.map(toSmartArticle),
          })
        })
      }
    }

    // Extract from legacy homepage feeds
    if (homepage?.feeds) {
      const feeds = homepage.feeds
      
      if (feeds.latest?.items) {
        const latestItems = feeds.latest.items.map(feedItemToShapedArticle).map(toSmartArticle)
        if (latestNews.length === 0) latestNews.push(...latestItems)
      }
      
      if (feeds.mostRead?.items) {
        mostRead.push(...feeds.mostRead.items.map(feedItemToShapedArticle).map(toSmartArticle))
      }
      
      if (feeds.ticker?.items) {
        ticker.push(...feeds.ticker.items.map(feedItemToShapedArticle).map(toTickerItem))
      }

      // Categories to sections
      if (feeds.categories?.items && sections.length === 0) {
        feeds.categories.items.forEach(catItem => {
          sections.push({
            categorySlug: catItem.category.slug,
            categoryName: catItem.category.name,
            articles: catItem.items.map(feedItemToShapedArticle).map(toSmartArticle),
          })
        })
      }
    }

    // If still no data, use hardcoded fallback
    if (latestNews.length === 0 && sections.length === 0) {
      return await createHardcodedSmartFallback(params)
    }

    // Build ticker from latestNews if not available
    const finalTicker = ticker.length > 0 
      ? ticker 
      : latestNews.slice(0, 10).map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          categorySlug: a.categorySlug,
          publishedAt: a.publishedAt,
        }))

    return {
      version: '2.0-fallback',
      timestamp: new Date().toISOString(),
      latestNews: latestNews.slice(0, params?.latestCount || 12),
      mostRead: mostRead.slice(0, params?.mostReadCount || 8),
      ticker: finalTicker,
      sections: sections.slice(0, params?.sectionsCount || 6),
      meta: {
        tenant: homepage?.tenant,
        theme: { key: themeKey },
        lang,
        generatedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('❌ Smart homepage fallback also failed:', error)
    return await createHardcodedSmartFallback(params)
  }
}

/**
 * Converts HomepageFeedItem to HomepageShapedArticle
 */
function feedItemToShapedArticle(item: HomepageFeedItem): HomepageShapedArticle {
  const coverUrl = item.image || item.coverImageUrl || item.coverImage || undefined
  const cat = item.category as { id?: string; slug?: string; name?: string } | undefined
  
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    excerpt: item.excerpt || null,
    coverImageUrl: coverUrl || null,
    publishedAt: item.publishedAt || item.createdAt || null,
    category: cat && typeof cat === 'object' ? {
      id: String(cat.id || ''),
      slug: String(cat.slug || ''),
      name: String(cat.name || ''),
    } : undefined,
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    languageCode: item.languageCode || null,
  }
}

/**
 * Last resort fallback with hardcoded data
 */
async function createHardcodedSmartFallback(params?: SmartHomepageParams): Promise<SmartHomepageResponse> {
  const articles = await getFallbackArticles()
  const categories = await getFallbackCategories()
  const lang = params?.lang || 'te'
  const themeKey = params?.themeKey || 'style1'

  const smartArticles: SmartHomepageArticle[] = articles.map(a => {
    const cat = a.category as { id?: string; slug?: string; name?: string } | undefined
    return {
      id: String(a.id),
      slug: String(a.slug || a.id),
      title: String(a.title || ''),
      excerpt: typeof a.excerpt === 'string' ? a.excerpt : null,
      imageUrl: typeof a.imageUrl === 'string' ? a.imageUrl : null,
      publishedAt: typeof a.publishedAt === 'string' ? a.publishedAt : null,
      categoryId: cat?.id,
      categorySlug: cat?.slug,
      categoryName: cat?.name,
    }
  })

  const tickerItems: SmartHomepageTickerItem[] = smartArticles.slice(0, 10).map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    categorySlug: a.categorySlug,
    publishedAt: a.publishedAt,
  }))

  const sections: SmartHomepageSection[] = categories.slice(0, params?.sectionsCount || 6).map(cat => ({
    categorySlug: cat.slug,
    categoryName: typeof cat.name === 'string' ? cat.name : cat.slug,
    articles: smartArticles.filter(a => a.categorySlug === cat.slug).slice(0, params?.articlesPerSection || 4),
  }))

  return {
    version: '2.0-hardcoded',
    timestamp: new Date().toISOString(),
    latestNews: smartArticles.slice(0, params?.latestCount || 12),
    mostRead: smartArticles.slice(0, params?.mostReadCount || 8),
    ticker: tickerItems,
    sections,
    meta: {
      totalArticles: articles.length,
      totalCategories: categories.length,
      lastUpdated: new Date().toISOString(),
      tenant: { slug: 'demo', name: 'కబుర్లు డెమో' },
      theme: { key: themeKey },
      lang,
      generatedAt: new Date().toISOString(),
    },
  }
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
  shape?: string
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
  shape?: string
}): Promise<NewHomepageResponse> => {
  const h = await headers()
  // ✅ Use X-Tenant-Domain header (set by proxy) instead of raw host
  const domain = domainFromHeaders(h)
  const lang = String(params.lang || 'en')
  const themeKey = String(params.themeKey || 'style1')
  const shape = params.shape || themeKey // Use themeKey as shape if not provided

  // Backend contract: GET /public/homepage?v=1&shape=style2&themeKey=style2&lang=te
  // Domain is inferred via X-Tenant-Domain header.
  const qs = new URLSearchParams({ v: String(params.v ?? '1'), domain })
  if (lang) qs.set('lang', lang)
  if (themeKey) qs.set('themeKey', themeKey)
  if (shape) qs.set('shape', shape)

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
  // ✅ Use X-Tenant-Domain header (set by proxy) instead of raw host
  const domain = domainFromHeaders(h)
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

function isValidArticleData(article: Article | null | undefined): article is Article {
  if (!article) return false
  // Must have id, slug, and title to be valid
  if (!article.id || !article.slug || !article.title) return false
  // Slug must be a reasonable string (not just whitespace or hash)
  const slug = String(article.slug).trim()
  if (slug.length < 3) return false
  return true
}

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
  // Filter out invalid articles to prevent 404 errors
  return items.map(feedItemToArticle).filter(isValidArticleData)
}

// ============================================
// 🔄 SMART HOMEPAGE TO ARTICLE CONVERTERS
// Backward compatibility helpers
// ============================================

/**
 * Converts HomepageShapedArticle to Article format
 * Used for backward compatibility with existing theme components
 */
export function shapedArticleToArticle(item: HomepageShapedArticle): Article {
  const coverUrl = item.coverImageUrl || item.image || undefined
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    excerpt: item.excerpt || null,
    coverImage: coverUrl ? { url: coverUrl } : undefined,
    publishedAt: item.publishedAt || undefined,
    category: item.category,
  } as Article
}

/**
 * Converts array of HomepageShapedArticle to Article array
 */
export function shapedArticlesToArticles(items: HomepageShapedArticle[]): Article[] {
  return items.map(shapedArticleToArticle).filter(isValidArticleData)
}

/**
 * Converts SmartHomepageArticle to Article format
 * Used for backward compatibility with existing theme components
 */
export function smartArticleToArticle(item: SmartHomepageArticle): Article {
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    excerpt: item.excerpt || null,
    coverImage: item.imageUrl ? { url: item.imageUrl } : undefined,
    publishedAt: item.publishedAt || undefined,
    category: item.categorySlug ? {
      slug: item.categorySlug,
      name: item.categoryName || item.categorySlug,
    } : undefined,
    isBreaking: item.isBreaking,
    readingTimeMin: item.readTime,
    viewCount: item.viewCount,
  } as Article
}

/**
 * Converts SmartHomepageTickerItem to Article format
 */
export function smartTickerToArticle(item: SmartHomepageTickerItem): Article {
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    publishedAt: item.publishedAt || undefined,
    category: item.categorySlug ? { slug: item.categorySlug } : undefined,
    isBreaking: item.isBreaking,
  } as Article
}

/**
 * Converts SmartHomepageResponse to legacy data structures
 * Use this for gradual migration from old APIs to smart-homepage
 */
export function smartHomepageToLegacy(smart: SmartHomepageResponse): {
  hero: Article[]
  topStories: Article[]
  mostRead: Article[]
  ticker: Article[]
  sectionDataMap: Record<string, Article[]>
} {
  const hero = smart.latestNews.slice(0, 1).map(smartArticleToArticle)
  const topStories = smart.latestNews.slice(1, 6).map(smartArticleToArticle)
  const mostRead = smart.mostRead.map(smartArticleToArticle)
  const ticker = smart.ticker.map(smartTickerToArticle)
  
  const sectionDataMap: Record<string, Article[]> = {}
  smart.sections.forEach(section => {
    sectionDataMap[section.categorySlug] = section.articles.map(smartArticleToArticle)
  })

  return { hero, topStories, mostRead, ticker, sectionDataMap }
}

// ---- Fallback homepage response ----

async function createFallbackHomepageResponse(lang: string, themeKey: string): Promise<NewHomepageResponse> {
  const articles = await getFallbackArticles()
  const categories = await getFallbackCategories()

  // Create feeds with fallback data - fill ALL sections completely
  const latestItems: HomepageFeedItem[] = articles.slice(0, 20).map(a => ({
    id: String(a.id),
    slug: String(a.slug || a.id),
    title: String(a.title || ''),
    excerpt: typeof a.excerpt === 'string' ? a.excerpt : null,
    content: typeof a.content === 'string' ? a.content : null,
    image: typeof a.imageUrl === 'string' ? a.imageUrl : null,
    coverImageUrl: typeof a.imageUrl === 'string' ? a.imageUrl : null,
    publishedAt: typeof a.publishedAt === 'string' ? a.publishedAt : null,
    category: a.category,
  }))

  // Create ticker items
  const tickerItems: HomepageFeedItem[] = articles.slice(0, 8).map(a => ({
    id: String(a.id),
    slug: String(a.slug || a.id),
    title: String(a.title || ''),
  }))

  // Create category feeds with MORE articles per category
  const categoryFeeds: HomepageCategoryFeedItem[] = categories.slice(0, 8).map(cat => {
    // Get articles for this category, or use general articles if none found
    // Type guard: check if category is an object with slug property
    const categoryArticles = articles.filter(a => {
      const cat_data = a.category as { slug?: string } | undefined
      return cat_data && typeof cat_data === 'object' && cat_data.slug === cat.slug
    })
    const articlesToUse = categoryArticles.length > 0 ? categoryArticles : articles
    
    return {
      category: {
        slug: cat.slug,
        name: cat.name,
        href: `/category/${cat.slug}`,
      },
      items: articlesToUse.slice(0, 8).map(a => ({
        id: String(a.id),
        slug: String(a.slug || a.id),
        title: String(a.title || ''),
        excerpt: typeof a.excerpt === 'string' ? a.excerpt : null,
        image: typeof a.imageUrl === 'string' ? a.imageUrl : null,
        publishedAt: typeof a.publishedAt === 'string' ? a.publishedAt : null,
        category: a.category,
      })),
    }
  })

  // Create mostRead items
  const mostReadItems: HomepageFeedItem[] = articles.slice(0, 6).map(a => ({
    id: String(a.id),
    slug: String(a.slug || a.id),
    title: String(a.title || ''),
    excerpt: typeof a.excerpt === 'string' ? a.excerpt : null,
    image: typeof a.imageUrl === 'string' ? a.imageUrl : null,
    publishedAt: typeof a.publishedAt === 'string' ? a.publishedAt : null,
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
  const shapedArticles: HomepageShapedArticle[] = articles.map(a => {
    const cat = a.category as { id?: string; slug?: string; name?: string } | undefined
    return {
      id: String(a.id),
      slug: String(a.slug || a.id),
      title: String(a.title || ''),
      excerpt: typeof a.excerpt === 'string' ? a.excerpt : null,
      coverImageUrl: typeof a.imageUrl === 'string' ? a.imageUrl : null,
      publishedAt: typeof a.publishedAt === 'string' ? a.publishedAt : null,
      category: cat && typeof cat === 'object' ? {
        id: String(cat.id || ''),
        slug: String(cat.slug || ''),
        name: String(cat.name || ''),
      } : undefined,
      tags: [], // Fallback articles don't have tags
      languageCode: lang,
    }
  })

  // Hero: 1 article
  const hero = shapedArticles.slice(0, 1)
  
  // Top Stories: 5 articles (skip hero article)
  const topStories = shapedArticles.slice(1, 6)

  // Create sections for specific categories - USE UNIQUE CATEGORIES ONLY
  const sections: HomepageShapedSection[] = []
  const sectionData: Record<string, HomepageShapedArticle[]> = {}

  // Define UNIQUE priority categories for sections (no duplicates!)
  const priorityCategories = ['latest', 'entertainment', 'political', 'breaking', 'sports', 'business']
  const usedArticleIds = new Set<string>()
  
  // Add hero and topStories IDs to used set
  hero.forEach(a => usedArticleIds.add(a.id))
  topStories.forEach(a => usedArticleIds.add(a.id))
  
  priorityCategories.forEach((catSlug, index) => {
    const category = categories.find(c => c.slug === catSlug || (catSlug === 'political' && c.slug === 'politics'))
    if (!category) return

    // Get articles for this category (excluding already used articles)
    const categoryArticles = shapedArticles.filter(a => 
      a.category?.slug === catSlug && !usedArticleIds.has(a.id)
    )
    
    // Fallback: use any unused articles if category doesn't have enough
    let articlesToUse: HomepageShapedArticle[] = []
    if (categoryArticles.length >= 6) {
      articlesToUse = categoryArticles.slice(0, 6)
    } else {
      // Get unused articles
      const unusedArticles = shapedArticles.filter(a => !usedArticleIds.has(a.id))
      articlesToUse = [...categoryArticles, ...unusedArticles].slice(0, 6)
    }
    
    // Mark these articles as used
    articlesToUse.forEach(a => usedArticleIds.add(a.id))

    // Safe category name extraction
    const catName = typeof category.name === 'string' 
      ? category.name 
      : (typeof category.name === 'object' && category.name !== null && 'name' in (category.name as object))
        ? String((category.name as Record<string, unknown>).name || category.slug)
        : category.slug

    const section: HomepageShapedSection = {
      key: catSlug,
      title: catName,
      position: index + 1,
      limit: 6,
      categorySlug: catSlug,
      items: articlesToUse,
    }

    sections.push(section)
    sectionData[catSlug] = articlesToUse
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

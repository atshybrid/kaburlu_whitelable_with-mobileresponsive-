import { fetchJSON } from '@/lib/remote'
import { getConfig, getCacheTTL } from '@/lib/config'

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
  category?: { id?: string; name?: string; slug?: string } | null
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
    totalViews?: number
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
    // Get cache TTL from config
    const config = await getConfig()
    const cacheTTL = getCacheTTL(config, 'homepage')
    
    // Use paginated list endpoint from backend spec
    const pageSize = config?.layout.articlesPerPage || 12
    const res = await fetchJSON<unknown>(`/public/articles?page=1&pageSize=${pageSize}` , { 
      tenantDomain: await currentDomain(),
      revalidateSeconds: cacheTTL,
    })
    return normalizeList(res)
  }
  async articleBySlug(_tenantSlug: string, slug: string) {
    void _tenantSlug
    const domain = await currentDomain()
    
    // Get cache TTL from config
    const config = await getConfig()
    const cacheTTL = getCacheTTL(config, 'article')
    
    // 🎯 PRIMARY: Use NEW article details API
    // API: /public/articles/{slug} (returns { article, seo, reporter, mustRead, meta, ... })
    const primaryPath = `/public/articles/${encodeURIComponent(slug)}`
    
    try {
      const res = await fetchJSON<unknown>(primaryPath, { 
        tenantDomain: domain,
        revalidateSeconds: cacheTTL,
      })
      
      // New API returns { status: "ok", article: {...}, publisher: {...}, related_articles: [...] }
      if (res && typeof res === 'object') {
        const response = res as Record<string, unknown>
        if (response.article && typeof response.article === 'object') {
          const art = response.article as Record<string, unknown>
          console.log(
            `📰 [ARTICLE API] slug="${slug}" | hasContent=${!!(art.content_html || art.contentHtml || art.content || art.body)} | keys=`,
            Object.keys(art).slice(0, 15),
          )
          // Map the new API response to our Article type
          const normalized = normalizeNewArticleResponse(response)
          if (process.env.NODE_ENV !== 'production') {
            console.log(`🧑‍💼 [REPORTER MAP] slug="${slug}" | hasTopLevelReporter=${!!response.reporter} | hasReporter=${!!normalized.reporter} | stats=`, {
              totalArticles: normalized.reporter?.totalArticles,
              totalViews: normalized.reporter?.totalViews,
            })
          }
          return normalized
        }
        // Fallback to direct response normalization
        console.log(`📰 [ARTICLE API FALLBACK] slug="${slug}" | keys=`, Object.keys(response).slice(0, 10))
        return normalizeItem(res)
      }
    } catch (error) {
      console.log(`⚠️ New article API failed for slug "${slug}":`, error)
    }
    
    // FALLBACK: Try legacy endpoints
    const fallbackPaths = [
      `/public/articles/${encodeURIComponent(slug)}?domainName=${encodeURIComponent(domain)}`,
      `/public/articles/${encodeURIComponent(slug)}?languageCode=te`,
      `/public/articles?slug=${encodeURIComponent(slug)}&domainName=${encodeURIComponent(domain)}&pageSize=1`,
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
    
    // Get cache TTL from config
    const config = await getConfig()
    const cacheTTL = getCacheTTL(config, 'category')
    const pageSize = config?.layout.articlesPerPage || 12
    
    const paths = [
      `/public/articles?category=${encodeURIComponent(categorySlug)}&page=1&pageSize=${pageSize}`,
      `/public/categories/${encodeURIComponent(categorySlug)}/articles?page=1&pageSize=${pageSize}`,
    ]
    for (const p of paths) {
      try {
        const res = await fetchJSON<unknown>(p, { 
          tenantDomain: await currentDomain(),
          revalidateSeconds: cacheTTL,
        })
        return normalizeList(res)
      } catch {
        // continue
      }
    }
    return []
  }
}

// 🎯 NEW: Fetch article page layout data (sidebar + bottom sections) in one call
export async function getArticlePageLayout(slug: string): Promise<ArticlePageLayout | null> {
  const domain = await currentDomain()
  
  try {
    const config = await getConfig()
    const cacheTTL = getCacheTTL(config, 'article')
    
    const res = await fetchJSON<unknown>(
      `/public/articles/page-layout?slug=${encodeURIComponent(slug)}`,
      { tenantDomain: domain, revalidateSeconds: cacheTTL }
    )
    
    if (res && typeof res === 'object') {
      const response = res as Record<string, unknown>
      if (response.layout && typeof response.layout === 'object') {
        return normalizePageLayout(response)
      }
    }
  } catch (error) {
    console.log('⚠️ Page layout API failed:', error)
  }
  
  return null
}

// 🎯 NEW: Fetch related articles
export async function getRelatedArticles(slug: string, limit = 6): Promise<Article[]> {
  const domain = await currentDomain()
  
  try {
    const res = await fetchJSON<unknown>(
      `/public/articles/related?slug=${encodeURIComponent(slug)}&limit=${limit}`,
      { tenantDomain: domain }
    )
    
    if (res && typeof res === 'object') {
      const response = res as Record<string, unknown>
      const articles = response.articles
      if (Array.isArray(articles)) {
        return articles.map(normalizeItem)
      }
    }
  } catch (error) {
    const msg = String(error || '')
    if (!msg.includes('Remote API 404')) {
      console.log('⚠️ Related articles API failed:', msg)
    }
  }
  
  return []
}

// 🎯 NEW: Fetch trending articles
export async function getTrendingArticles(limit = 4, excludeSlug?: string): Promise<Article[]> {
  const domain = await currentDomain()
  
  try {
    let url = `/public/articles/trending?limit=${limit}&hours=24`
    if (excludeSlug) url += `&excludeSlug=${encodeURIComponent(excludeSlug)}`
    
    const res = await fetchJSON<unknown>(url, { tenantDomain: domain })
    
    if (res && typeof res === 'object') {
      const response = res as Record<string, unknown>
      const articles = response.articles
      if (Array.isArray(articles)) {
        return articles.map(normalizeItem)
      }
    }
  } catch (error) {
    const msg = String(error || '')
    if (!msg.includes('Remote API 404')) {
      console.log('⚠️ Trending articles API failed:', msg)
    }
  }
  
  return []
}

// 🎯 NEW: Fetch must-read articles
export async function getMustReadArticles(limit = 5, excludeSlug?: string): Promise<Article[]> {
  const domain = await currentDomain()
  
  try {
    let url = `/public/articles/must-read?limit=${limit}`
    if (excludeSlug) url += `&excludeSlug=${encodeURIComponent(excludeSlug)}`
    
    const res = await fetchJSON<unknown>(url, { tenantDomain: domain })
    
    if (res && typeof res === 'object') {
      const response = res as Record<string, unknown>
      const articles = response.articles
      if (Array.isArray(articles)) {
        return articles.map(normalizeItem)
      }
    }
  } catch (error) {
    const msg = String(error || '')
    if (!msg.includes('Remote API 404')) {
      console.log('⚠️ Must-read articles API failed:', msg)
    }
  }
  
  return []
}

// 🎯 NEW: Fetch latest articles for sidebar
export async function getLatestArticles(limit = 7, excludeSlug?: string): Promise<Article[]> {
  const domain = await currentDomain()
  
  try {
    let url = `/public/articles/latest?limit=${limit}`
    if (excludeSlug) url += `&excludeSlug=${encodeURIComponent(excludeSlug)}`
    
    const res = await fetchJSON<unknown>(url, { tenantDomain: domain })
    
    if (res && typeof res === 'object') {
      const response = res as Record<string, unknown>
      const articles = response.articles
      if (Array.isArray(articles)) {
        return articles.map(normalizeItem)
      }
    }
  } catch (error) {
    const msg = String(error || '')
    if (!msg.includes('Remote API 404')) {
      console.log('⚠️ Latest articles API failed:', msg)
    }
  }
  
  return []
}

// Article page layout types
export interface ArticlePageLayout {
  side: {
    latest: Article[]
    mustRead: Article[]
  }
  bottom: {
    related: Article[]
    trending: Article[]
  }
  publisher?: {
    id?: string
    name?: string
    logoUrl?: string
  }
}

function normalizePageLayout(response: Record<string, unknown>): ArticlePageLayout {
  const layout = response.layout as Record<string, unknown> || {}
  const side = layout.side as Record<string, unknown> || {}
  const bottom = layout.bottom as Record<string, unknown> || {}
  
  const normalizeSection = (section: unknown): Article[] => {
    if (!section || typeof section !== 'object') return []
    const s = section as Record<string, unknown>
    const articles = s.articles
    if (Array.isArray(articles)) {
      return articles.map(normalizeItem)
    }
    return []
  }
  
  const publisher = response.publisher as Record<string, unknown> | undefined
  
  return {
    side: {
      latest: normalizeSection(side.latest),
      mustRead: normalizeSection(side.mustRead),
    },
    bottom: {
      related: normalizeSection(bottom.related),
      trending: normalizeSection(bottom.trending),
    },
    publisher: publisher ? {
      id: typeof publisher.id === 'string' ? publisher.id : undefined,
      name: typeof publisher.name === 'string' ? publisher.name : undefined,
      logoUrl: typeof publisher.logo_url === 'string' ? publisher.logo_url : undefined,
    } : undefined,
  }
}

// Normalize the new SEO-friendly article API response
function normalizeNewArticleResponse(response: Record<string, unknown>): Article {
  const article = response.article as Record<string, unknown>
  const publisher = response.publisher as Record<string, unknown> | undefined
  const responseReporter = response.reporter && typeof response.reporter === 'object' ? (response.reporter as Record<string, unknown>) : undefined
  const relatedArticles = response.related_articles as unknown[] | undefined
  const mustReadList = Array.isArray(response.mustRead) ? (response.mustRead as unknown[]) : undefined
  
  function str(v: unknown) {
    return typeof v === 'string' ? v : undefined
  }

  function idStr(v: unknown) {
    if (typeof v === 'string') return v
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
    return undefined
  }

  function obj(v: unknown) {
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined
  }

  function escapeHtml(s: string) {
    return s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function looksLikeHtml(s: string) {
    return /<\s*(p|div|br|h\d|ul|ol|li|img|figure|blockquote|span|strong|em)\b/i.test(s)
  }

  function stripLeadingH1(html: string) {
    // Backend sometimes includes <h1>Title</h1> inside contentHtml.
    // We already render the title separately, so strip the first h1 for cleaner UX.
    return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '')
  }

  function blocksToHtml(blocks: unknown, inlineImages: unknown) {
    if (!Array.isArray(blocks)) return undefined

    const imgs = Array.isArray(inlineImages) ? (inlineImages as unknown[]) : []
    let imgIndex = 0

    const out: string[] = []
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      if (!b || typeof b !== 'object') continue
      const bo = b as Record<string, unknown>
      const subhead = str(bo.subhead)
      if (subhead) out.push(`<h2>${escapeHtml(subhead)}</h2>`)

      const paras = Array.isArray(bo.paragraphs) ? (bo.paragraphs as unknown[]) : []
      for (const p of paras) {
        if (typeof p !== 'string') continue
        const t = p.trim()
        if (!t) continue
        out.push(`<p>${escapeHtml(t).replace(/\n/g, '<br />')}</p>`)
      }

      // Insert inline images every 2 blocks (best-effort, backend may not provide placement)
      if (imgs.length > 0 && (i + 1) % 2 === 0 && imgIndex < imgs.length) {
        const img = imgs[imgIndex++]
        const u = typeof img === 'string' ? img : (img && typeof img === 'object' ? (img as Record<string, unknown>).url : undefined)
        const url = typeof u === 'string' ? normalizeMediaUrl(u) : undefined
        const alt = img && typeof img === 'object' && typeof (img as Record<string, unknown>).alt === 'string' ? String((img as Record<string, unknown>).alt) : ''
        const caption = img && typeof img === 'object' && typeof (img as Record<string, unknown>).caption === 'string' ? String((img as Record<string, unknown>).caption) : ''
        if (url) {
          out.push(
            `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`,
          )
        }
      }
    }
    return out.length > 0 ? out.join('') : undefined
  }

  function textToParagraphHtml(text: string) {
    const normalized = text.replace(/\r\n/g, '\n').trim()
    if (!normalized) return ''
    const paras = normalized.split(/\n\s*\n+/g)
    return paras
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
      .join('')
  }

  const contentObj = obj(article.content)
  const blocks = contentObj?.blocks
  const inlineImages = contentObj?.inlineImages

  const articleObj = article as Record<string, unknown>
  const authorLike = obj(articleObj.author) || obj(articleObj.reporter) || obj(responseReporter)
  const normalizeName = (name?: string) => {
    const n = typeof name === 'string' ? name.trim() : ''
    if (!n) return undefined
    if (n.toLowerCase() === 'unknown') return undefined
    return n
  }

  const authorName =
    normalizeName(str(authorLike?.name)) ||
    str(articleObj.author_name) ||
    str(articleObj.reporter_name) ||
    str(articleObj.byline) ||
    (Array.isArray(articleObj.authors) && typeof (articleObj.authors as unknown[])[0] === 'object'
      ? str(((articleObj.authors as unknown[])[0] as Record<string, unknown>).name)
      : undefined)

  const authorLocationRaw = authorLike?.location
  const authorLocationObj = obj(authorLocationRaw)
  const authorLocation = authorLocationObj
    ? {
        state: normalizeName(str(authorLocationObj.state)) || normalizeName(str(authorLocationObj.region)) || normalizeName(str(authorLocationObj.name)) || undefined,
        district: normalizeName(str(authorLocationObj.district)) || undefined,
        mandal: normalizeName(str(authorLocationObj.mandal)) || undefined,
      }
    : typeof authorLocationRaw === 'string'
      ? { state: authorLocationRaw }
      : undefined

  const authorStats = obj(authorLike?.stats)
  const asNum = (v: unknown) => {
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string') {
      const trimmed = v.trim()
      if (!trimmed) return undefined
      const n = Number(trimmed)
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }

  const totalArticles =
    asNum(authorStats?.totalArticles) ??
    asNum(authorStats?.total_articles) ??
    asNum((authorLike as Record<string, unknown> | undefined)?.totalArticles) ??
    asNum((authorLike as Record<string, unknown> | undefined)?.total_articles)

  const totalViews =
    asNum(authorStats?.totalViews) ??
    asNum(authorStats?.total_views) ??
    asNum((authorLike as Record<string, unknown> | undefined)?.totalViews) ??
    asNum((authorLike as Record<string, unknown> | undefined)?.total_views)

  const recentRaw = (authorLike && (authorLike as Record<string, unknown>))
  const recentArticlesRaw =
    (recentRaw && Array.isArray(recentRaw.recentArticles) ? (recentRaw.recentArticles as unknown[]) : undefined) ||
    (recentRaw && Array.isArray(recentRaw.recent_articles) ? (recentRaw.recent_articles as unknown[]) : undefined)

  const recentArticles = Array.isArray(recentArticlesRaw)
    ? recentArticlesRaw
        .map((ra) => {
          if (!ra || typeof ra !== 'object') return null
          const r = ra as Record<string, unknown>
          return {
            id: typeof r.id === 'string' ? r.id : undefined,
            slug: typeof r.slug === 'string' ? r.slug : undefined,
            title: typeof r.title === 'string' ? r.title : (typeof r.headline === 'string' ? r.headline : undefined),
            coverImageUrl:
              typeof r.coverImageUrl === 'string'
                ? r.coverImageUrl
                : (typeof r.cover_image_url === 'string' ? r.cover_image_url : undefined),
            publishedAt: typeof r.publishedAt === 'string' ? r.publishedAt : (typeof r.published_at === 'string' ? r.published_at : undefined),
            viewCount: typeof r.viewCount === 'number' ? r.viewCount : (typeof r.view_count === 'number' ? r.view_count : undefined),
            category: r.category ? normalizeCategory(r.category) : undefined,
          }
        })
        .filter(Boolean)
    : undefined

  const inlineImagesNormalized = Array.isArray(inlineImages)
    ? (inlineImages as unknown[])
        .map((img) => {
          if (!img) return null
          if (typeof img === 'string') return { url: normalizeMediaUrl(img) }
          if (typeof img !== 'object') return null
          const io = img as Record<string, unknown>
          const url = typeof io.url === 'string' ? normalizeMediaUrl(io.url) : undefined
          if (!url) return null
          return {
            url,
            alt: typeof io.alt === 'string' ? io.alt : undefined,
            caption: typeof io.caption === 'string' ? io.caption : undefined,
          }
        })
        .filter(Boolean)
    : undefined

  const inlineImagesFromArticleImages = Array.isArray((article.images as Record<string, unknown>)?.inline)
    ? (((article.images as Record<string, unknown>).inline as unknown[]) as unknown[])
        .map((img: unknown) => {
          if (!img || typeof img !== 'object') return null
          const i = img as Record<string, unknown>
          const url = typeof i.url === 'string' ? normalizeMediaUrl(i.url) : undefined
          if (!url) return null
          return {
            url,
            alt: typeof i.alt === 'string' ? i.alt : undefined,
            caption: typeof i.caption === 'string' ? i.caption : undefined,
          }
        })
        .filter(Boolean)
    : []

  const mediaImages = [
    ...(inlineImagesNormalized ?? []),
    ...inlineImagesFromArticleImages,
  ]

  // Content - check multiple field names + nested shapes
  const contentCandidate =
    str(article.content_html) ||
    str(article.contentHtml) ||
    str(article.body_html) ||
    str(article.bodyHtml) ||
    str(article.description_html) ||
    str(article.descriptionHtml) ||
    str(article.html) ||
    str(article.content) ||
    str(article.body) ||
    // Some backends nest content inside `article.content` object
    str(obj(article.content)?.content_html) ||
    str(obj(article.content)?.contentHtml) ||
    str(obj(article.content)?.contentHTML) ||
    str(obj(article.content)?.html) ||
    str(obj(article.content)?.rendered) ||
    str(obj(article.content)?.value) ||
    // Prefer HTML over plain text
    str(obj(article.content)?.plainText) ||
    str(obj(article.body)?.html) ||
    str(obj(article.body)?.rendered) ||
    str(obj(article.body)?.value) ||
    (Array.isArray(article.paragraphs)
      ? (article.paragraphs as unknown[]).filter((p) => typeof p === 'string').map((p) => `<p>${escapeHtml(String(p))}</p>`).join('')
      : undefined)

  const contentFromBlocks = blocksToHtml(blocks, inlineImages)

  const contentHtmlRaw = contentCandidate
    ? (looksLikeHtml(contentCandidate) ? contentCandidate : textToParagraphHtml(contentCandidate))
    : contentFromBlocks

  const contentHtml = contentHtmlRaw ? stripLeadingH1(contentHtmlRaw) : undefined
  
  // Map new API fields to Article type
  const a: Record<string, unknown> = {
    id: article.id,
    slug: article.slug,
    title: article.headline || article.title,
    subtitle: article.subheadline || article.subtitle,
    contentHtml: contentHtml,
    content: contentHtml, // Also set content for fallback
    plainText: str(article.plainText) || str(contentObj?.plainText),
    excerpt: article.excerpt || article.summary || str(contentObj?.excerpt),
    highlights: (Array.isArray(contentObj?.highlights) ? (contentObj?.highlights as unknown[]).filter((h) => typeof h === 'string') as string[] : undefined),

    // Preserve richer structured content for best UX renderers
    contentData: contentObj,
    contentBlocks: Array.isArray(blocks) ? blocks : undefined,
    inlineImages: inlineImagesNormalized,
    
    // Category - store both singular and array format
    category: article.category || null,
    categories: article.category ? [article.category] : [],
    
    // Dates
    publishedAt: (article.dateline as Record<string, unknown>)?.published_at,
    updatedAt: (article.dateline as Record<string, unknown>)?.updated_at,
    
    reporter: (() => {
      if (!authorLike) return null

      const hasStats = typeof totalArticles === 'number' || typeof totalViews === 'number'
      const hasAny =
        !!authorName ||
        typeof authorLike.id === 'string' ||
        typeof authorLike.id === 'number' ||
        typeof authorLike.profilePhoto === 'string' ||
        typeof authorLike.photo_url === 'string' ||
        typeof authorLike.photoUrl === 'string' ||
        typeof authorLike.designation === 'string' ||
        typeof (authorLike as Record<string, unknown>).bio === 'string' ||
        !!authorLocation ||
        hasStats ||
        (Array.isArray(recentArticles) && recentArticles.length > 0)

      if (!hasAny) return null

      return {
        id: idStr(authorLike.id),
        name: authorName || 'Staff Reporter',
        photoUrl: str(authorLike.profilePhoto) || str(authorLike.photo_url) || str(authorLike.photoUrl),
        designation: normalizeName(str(authorLike.designation)) || normalizeName(str(articleObj.author_designation)) || 'Reporter',
        location: authorLocation,
        totalArticles,
        totalViews,
        recentArticles,
      }
    })(),
    
    // Images from new API
    coverImage: (article.images as Record<string, unknown>)?.cover
      ? {
          url: ((article.images as Record<string, unknown>).cover as Record<string, unknown>).url,
          alt: ((article.images as Record<string, unknown>).cover as Record<string, unknown>).alt,
        }
      : (str(contentObj?.coverImage)
          ? { url: normalizeMediaUrl(str(contentObj?.coverImage)!) }
          : null),

    // Some backends provide cover image inside content object
    coverImageUrl: str(contentObj?.coverImage),

    media: mediaImages.length > 0 ? { images: mediaImages } : undefined,
    
    // SEO from new API
    meta: {
      seoTitle: (article.seo as Record<string, unknown>)?.title,
      metaDescription: (article.seo as Record<string, unknown>)?.description,
    },
    
    // JSON-LD
    jsonLd: article.jsonLd,
    
    // Counts
    viewCount: article.viewCount,
    shareCount: article.shareCount,
    isBreaking: article.isBreaking,
    isLive: article.isLive,
    tags: article.tags,
    
    // Publisher
    publisher: publisher ? {
      id: publisher.id,
      name: publisher.name,
      nativeName: publisher.native_name,
      logoUrl: publisher.logo_url,
    } : null,
    
    // Related articles
    related: Array.isArray(relatedArticles) 
      ? relatedArticles.map((r: unknown) => {
          const rel = r as Record<string, unknown>
          return {
            id: rel.id,
            slug: rel.slug,
            title: rel.headline,
            coverImageUrl: rel.cover_image_url,
            publishedAt: rel.published_at,
          }
        })
      : null,

    // Must-read list comes as a top-level array in the new API
    mustReadList: mustReadList,
    mustRead: mustReadList && mustReadList.length > 0 ? mustReadList[0] : null,
  }
  
  return normalizeItem(a)
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
    title: o.title || o.headline,
    coverImageUrl: o.coverImageUrl || o.cover_image_url || o.image || o.imageUrl,
    publishedAt: o.publishedAt || o.published_at,
    viewCount: o.viewCount || o.view_count,
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
  
  // Content - support many backend shapes and normalize to HTML when needed
  const plainText = typeof o.plainText === 'string' ? o.plainText : undefined

  const asObj = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined)
  const asStr = (v: unknown) => (typeof v === 'string' ? v : undefined)

  const escapeHtml = (s: string) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const looksLikeHtml = (s: string) => /<\s*([a-z][\w:-]*)\b/i.test(s)
  const hasParagraphBlocks = (s: string) => /<\s*\/\s*p\s*>/i.test(s)

  const textToParagraphHtml = (text: string) => {
    const normalized = text.replace(/\r\n/g, '\n').trim()
    if (!normalized) return ''
    const paras = normalized.split(/\n\s*\n+/g)
    return paras
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
      .join('')
  }

  const contentCandidate =
    asStr(o.content_html) ||
    asStr(o.contentHtml) ||
    asStr(o.body_html) ||
    asStr(o.bodyHtml) ||
    asStr(o.description_html) ||
    asStr(o.descriptionHtml) ||
    asStr(o.html) ||
    asStr(o.content) ||
    asStr(o.body) ||
    // Some backends nest content inside `content` object
    asStr(asObj(o.content)?.content_html) ||
    asStr(asObj(o.content)?.contentHtml) ||
    asStr(asObj(o.content)?.contentHTML) ||
    asStr(asObj(o.content)?.html) ||
    asStr(asObj(o.content)?.rendered) ||
    asStr(asObj(o.content)?.value) ||
    // Prefer HTML over plain text
    asStr(asObj(o.content)?.plainText) ||
    asStr(asObj(o.body)?.html) ||
    asStr(asObj(o.body)?.rendered) ||
    asStr(asObj(o.body)?.value) ||
    (Array.isArray(o.paragraphs)
      ? (o.paragraphs as unknown[])
          .filter((p) => typeof p === 'string')
          .map((p) => `<p>${escapeHtml(String(p))}</p>`)
          .join('')
      : undefined)

  const stripLeadingH1 = (html: string) => html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '')

  const contentHtmlNormalizedRaw = contentCandidate
    ? (looksLikeHtml(contentCandidate)
        ? (hasParagraphBlocks(contentCandidate) ? contentCandidate : `<p>${contentCandidate}</p>`)
        : textToParagraphHtml(contentCandidate))
    : undefined

  const contentHtmlNormalized = contentHtmlNormalizedRaw ? stripLeadingH1(contentHtmlNormalizedRaw) : undefined

  const contentHtml = contentHtmlNormalized
  const content = contentHtmlNormalized
  
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

  const mustReadList = Array.isArray(o.mustReadList)
    ? (o.mustReadList.map((item) => normalizeNestedArticle(item)).filter(Boolean) as Article['trending'])
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
    mustReadList,
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

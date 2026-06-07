import type { Article } from '@/lib/data-sources'

export interface ArticleSeoContext {
  canonicalUrl: string
  siteName: string
  siteUrl: string
  publisherLogo?: string | null
  lang: string
  categoryName?: string
  categorySlug?: string
}

function pickString(v: unknown): string | undefined {
  const s = String(v ?? '').trim()
  return s || undefined
}

function pickFrom(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj
  for (const key of path) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

function pickFirstString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    const s = pickString(v)
    if (s) return s
  }
  return undefined
}

/** Build SEO/AEO context for an article page */
export function buildArticleSeoContext(opts: {
  article: Article
  categorySlug: string
  domain: string
  tenantName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: any
  tenantSlug?: string
}): ArticleSeoContext {
  const { article, categorySlug, domain, tenantName, settings, tenantSlug } = opts

  const canonicalBase =
    pickString(settings?.seo?.canonicalBaseUrl) ||
    pickString(settings?.settings?.seo?.canonicalBaseUrl) ||
    (domain === 'localhost' ? 'http://localhost:3000' : `https://${domain}`)

  const siteName =
    pickString(settings?.branding?.siteName) ||
    pickString(settings?.settings?.branding?.siteName) ||
    tenantName ||
    'Kaburlu News'

  const publisherLogo =
    pickString(settings?.branding?.logoUrl) ||
    pickString(settings?.settings?.branding?.logoUrl) ||
    null

  const langRaw = pickString(settings?.content?.defaultLanguage) || 'te'
  const lang = langRaw === 'telugu' ? 'te' : langRaw.split('-')[0]

  const categoryName =
    pickFirstString(
      pickFrom(article, ['category', 'name']),
      pickFrom(article, ['category', 'title']),
      article.categories?.[0]?.name,
    ) || categorySlug

  const articleSlug = article.slug || article.id
  const pathPrefix = tenantSlug ? `/t/${tenantSlug}` : ''
  const canonicalUrl = `${canonicalBase}${pathPrefix}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`

  return {
    canonicalUrl,
    siteName,
    siteUrl: canonicalBase,
    publisherLogo,
    lang,
    categoryName,
    categorySlug,
  }
}

import SeoMaster from '@/components/SeoMaster'
import { getArticleBySlug } from '@/lib/data'
import { getCategoriesForNav, type Category } from '@/lib/categories'
import { getEffectiveSettingsForDomain } from '@/lib/settings'
import type { EffectiveSettings } from '@/lib/remote'
import { resolveTenant } from '@/lib/tenant'
import { headers } from 'next/headers'

function pickString(v: unknown) {
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

function pickFirstString(...vals: unknown[]) {
  for (const v of vals) {
    const s = pickString(v)
    if (s) return s
  }
  return undefined
}

function pickFirstArray(obj: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = obj[k]
    if (Array.isArray(v)) return v
  }
  return undefined
}

function flattenCategories(items: Category[]): Category[] {
  const out: Category[] = []
  const stack = [...items]
  while (stack.length) {
    const c = stack.shift()!
    out.push(c)
    if (Array.isArray(c.children) && c.children.length) stack.push(...c.children)
  }
  return out
}

async function resolveCategoryNameFromArticle(a: Record<string, unknown>): Promise<string | undefined> {
  // Backend may provide category IDs (uuid/cuid-like) or slugs; try both.
  const raw = (a.categories as unknown) ?? (a.categoryIds as unknown)
  const first = Array.isArray(raw) ? raw[0] : undefined
  const firstStr = pickString(first)
  if (!firstStr) return undefined

  try {
    const nav = await getCategoriesForNav()
    const all = flattenCategories(nav)
    const byId = all.find((c) => String(c.id) === firstStr)
    if (byId?.name) return byId.name
    const bySlug = all.find((c) => String(c.slug) === firstStr)
    if (bySlug?.name) return bySlug.name
  } catch {
    // ignore
  }
  return undefined
}

function langFromSettings(languageCodeRaw: unknown) {
  const raw = String(languageCodeRaw || 'en').trim().toLowerCase()
  if (raw === 'telugu') return 'te'
  if (raw === 'hindi') return 'hi'
  if (raw === 'tamil') return 'ta'
  if (raw === 'kannada') return 'kn'
  return raw.split('-')[0] || 'en'
}

function articleUrl({ baseUrl, tenantSlug, slug }: { baseUrl: string; tenantSlug: string; slug: string }) {
  const b = String(baseUrl || '').replace(/\/$/, '')
  return `${b}/t/${encodeURIComponent(tenantSlug)}/article/${encodeURIComponent(slug)}`
}

export default async function Head({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>
}) {
  const { tenant: tenantSlug, slug } = await params

  // For path-based multitenancy on platforms like Vercel, host may be the app domain.
  // Resolve tenant via route param and use its domain for remote API calls.
  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  const domain = tenant.domain || 'localhost'

  // Keep headers() call so Next can vary caching per request when needed.
  await headers()

  const settings: EffectiveSettings = await getEffectiveSettingsForDomain(domain).catch(() => ({} as EffectiveSettings))

  const canonicalBase =
    pickString(settings?.seo?.canonicalBaseUrl) ||
    pickString(settings?.settings?.seo?.canonicalBaseUrl) ||
    (domain === 'localhost' ? 'http://localhost:3000' : `https://${domain}`)

  const url = articleUrl({ baseUrl: canonicalBase, tenantSlug, slug })

  const publisherName =
    pickString(settings?.branding?.siteName) ||
    pickString(settings?.settings?.branding?.siteName) ||
    'Kaburlu News'

  const publisherLogo =
    pickString(settings?.branding?.logoUrl) || pickString(settings?.settings?.branding?.logoUrl)

  const language = langFromSettings(settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage)

  const article = await getArticleBySlug(tenant.id, slug)
  if (!article) return null

  const a = article as Record<string, unknown>

  // Prefer explicit SEO fields from backend if present
  const seoTitle = pickString(pickFrom(a, ['meta', 'seoTitle']))
  const seoDescription = pickString(pickFrom(a, ['meta', 'metaDescription']))

  const title = String(seoTitle || article.title || '')
  const summary = pickFirstString(
    seoDescription,
    a.excerpt,
    a.summary,
    a.description,
    // Some backends send empty excerpt; fall back to a shorter plainText when available
    typeof a.plainText === 'string' ? a.plainText.slice(0, 220) : undefined,
  )
  const image =
    pickFirstString(pickFrom(a, ['coverImage', 'url']), a.imageUrl, a.featuredImage) || undefined

  const createdAt =
    pickString(a.publishedAt) || pickString(a.createdAt) || pickString(a.datePublished) || undefined
  const updatedAt = pickString(a.updatedAt) || pickString(a.dateModified) || createdAt

  const authorName =
    pickFirstString(
      pickFrom(a, ['author', 'name']),
      pickFrom(a, ['authors', '0', 'name']),
      a.authorName,
    ) || undefined

  const categoryName =
    pickFirstString(
      pickFrom(a, ['categories', '0', 'category', 'name']),
      a.categoryName,
      a.section,
    ) || undefined

  const categoryNameResolved = categoryName || (await resolveCategoryNameFromArticle(a))

  const keywordsArr = pickFirstArray(a, ['keywords', 'tags'])
  const keywords = Array.isArray(keywordsArr) ? (keywordsArr as unknown[]).map((k) => String(k)) : undefined
  const location = pickString(a.location) || pickString(a.city) || pickString(a.region) || 'India'

  return (
    <SeoMaster
      tenant={{ domain, language, publisherName, publisherLogo }}
      url={url}
      article={{
        title,
        summary,
        image,
        slug,
        createdAt: createdAt || undefined,
        updatedAt: updatedAt || undefined,
        categoryName: categoryNameResolved || undefined,
        keywords: keywords || undefined,
        authorName: authorName || undefined,
        location,
      }}
    />
  )
}

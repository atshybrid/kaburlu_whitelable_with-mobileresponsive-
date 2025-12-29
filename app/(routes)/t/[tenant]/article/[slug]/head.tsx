import SeoMaster from '@/components/SeoMaster'
import { getArticleBySlug } from '@/lib/data'
import { getEffectiveSettings } from '@/lib/settings'
import { normalizeTenantDomain } from '@/lib/remote'
import type { EffectiveSettings } from '@/lib/remote'
import { headers } from 'next/headers'

function pickString(v: unknown) {
  const s = String(v ?? '').trim()
  return s || undefined
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

  const h = await headers()
  const domain = normalizeTenantDomain(h.get('host') || 'localhost')

  const settings: EffectiveSettings = await getEffectiveSettings().catch(() => ({} as EffectiveSettings))

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

  const article = await getArticleBySlug('na', slug)
  if (!article) return null

  const a = article as Record<string, unknown>

  const title = String(article.title || '')
  const summary = pickString(a.excerpt) || pickString(a.summary) || pickString(a.description)
  const image = pickString((a.coverImage as any)?.url) || pickString(a.imageUrl) || pickString(a.featuredImage)

  const createdAt =
    pickString(a.publishedAt) || pickString(a.createdAt) || pickString(a.datePublished) || undefined
  const updatedAt = pickString(a.updatedAt) || pickString(a.dateModified) || createdAt

  const authorName = pickString((a.author as any)?.name) || pickString(a.authorName) || undefined

  const categoryName =
    pickString((a.categories as any)?.[0]?.category?.name) ||
    pickString(a.categoryName) ||
    pickString(a.section)

  const keywords = Array.isArray(a.keywords) ? (a.keywords as unknown[]).map((k) => String(k)) : undefined
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
        categoryName: categoryName || undefined,
        keywords: keywords || undefined,
        authorName: authorName || undefined,
        location,
      }}
    />
  )
}

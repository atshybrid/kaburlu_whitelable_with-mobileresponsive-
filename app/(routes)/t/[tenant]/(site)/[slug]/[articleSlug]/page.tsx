/**
 * SEO-Friendly Article Page for Path-based Multitenancy
 *
 * URL: /t/[tenant]/[slug]/[articleSlug]
 * Example: localhost:3000/t/kaburlutoday/politics/some-article-slug
 *
 * ✅ Supports the new /{category}/{article-slug} URL structure in path mode
 * ✅ Mirrors app/[slug]/[articleSlug]/page.tsx for domain mode
 */

import { getArticleBySlug } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain, getEffectiveSettingsForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { notFound } from 'next/navigation'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Reserved slugs that should NOT be treated as category slugs
const RESERVED_SLUGS = [
  'article',
  'category',
  'api',
  'search',
  'about',
  'contact',
  'privacy-policy',
  'terms',
  'sitemap',
  'robots',
  '_next',
  'static',
]

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; slug: string; articleSlug: string }>
}): Promise<Metadata> {
  const { tenant: tenantSlug, slug: categorySlug, articleSlug } = await params

  if (RESERVED_SLUGS.includes(categorySlug.toLowerCase())) {
    return { title: 'Not Found' }
  }

  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  const domain = tenant.domain || 'localhost'

  const article = await getArticleBySlug(tenant.id, articleSlug)
  if (!article) return { title: 'Article Not Found' }

  const a = article as Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await getEffectiveSettingsForDomain(domain).catch(() => ({})) as any

  const canonicalBase =
    pickString(settings?.seo?.canonicalBaseUrl) ||
    pickString(settings?.settings?.seo?.canonicalBaseUrl) ||
    (domain === 'localhost' ? 'http://localhost:3000' : `https://${domain}`)

  const publisherName =
    pickString(settings?.branding?.siteName) ||
    pickString(settings?.settings?.branding?.siteName) ||
    tenant.name ||
    'Kaburlu News'

  const seoTitle = pickString(pickFrom(a, ['meta', 'seoTitle']))
  const seoDescription = pickString(pickFrom(a, ['meta', 'metaDescription']))

  const title = String(seoTitle || article.title || '')
  const description = pickFirstString(
    seoDescription,
    a.excerpt,
    a.summary,
    a.description,
    typeof a.plainText === 'string' ? a.plainText.slice(0, 220) : undefined,
  ) || ''

  const image = pickFirstString(
    a.coverImageUrl,
    pickFrom(a, ['coverImage', 'url']),
    a.imageUrl,
    a.featuredImage,
    a.image,
  )

  const url = `${canonicalBase}/t/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`
  const createdAt = pickString(a.publishedAt) || pickString(a.createdAt)
  const updatedAt = pickString(a.updatedAt) || createdAt

  const categoryName = pickFirstString(
    pickFrom(a, ['category', 'name']),
    pickFrom(a, ['category', 'title']),
    a.categoryName,
  )

  const authorName = pickFirstString(
    pickFrom(a, ['author', 'name']),
    pickFrom(a, ['author', 'displayName']),
    a.authorName,
  )

  return {
    title,
    description,
    authors: authorName ? [{ name: authorName }] : [],
    openGraph: {
      title,
      description,
      url,
      siteName: publisherName,
      type: 'article',
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      ...(categoryName ? { section: categoryName } : {}),
      ...(authorName ? { authors: [authorName] } : {}),
      images: image ? [{ url: image, width: 1200, height: 675, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: url,
    },
  }
}

async function getThemeArticle(themeKey: string) {
  switch (themeKey) {
    case 'style2':
      return (await import('@/themes/style2')).ThemeArticle
    case 'style3':
      return (await import('@/themes/style3')).ThemeArticle
    case 'tv9':
      return (await import('@/themes/tv9')).ThemeArticle
    case 'toi':
      return (await import('@/themes/toi')).ThemeArticle
    case 'style1':
    default:
      return (await import('@/themes/style1')).ThemeArticle
  }
}

export default async function TenantSEOArticlePage({
  params,
}: {
  params: Promise<{ tenant: string; slug: string; articleSlug: string }>
}) {
  const { tenant: tenantSlug, slug: categorySlug, articleSlug } = await params

  if (RESERVED_SLUGS.includes(categorySlug.toLowerCase())) {
    return notFound()
  }

  const tenant = await resolveTenant({ slugOverride: tenantSlug })

  if (tenant.isDomainNotLinked) {
    return <DomainNotLinked domain={tenant.domain || 'unknown'} />
  }

  if (tenant.isApiError) {
    return (
      <TechnicalIssues
        title="Technical Issues"
        message="We're experiencing technical difficulties. Please contact Kaburlu Media support."
      />
    )
  }

  if (tenant.domain) {
    const settingsResult = await getSettingsResultForDomain(tenant.domain)
    if (settingsResult.isDomainNotLinked) {
      return <DomainNotLinked domain={tenant.domain} />
    }
    if (settingsResult.isApiError) {
      return (
        <TechnicalIssues
          title="Technical Issues"
          message="We're experiencing technical difficulties. Please contact Kaburlu Media support."
        />
      )
    }
  }

  // Fetch article by articleSlug (category is for SEO URL, article is fetched by slug)
  const article = await getArticleBySlug(tenant.id, articleSlug)
  if (!article) return notFound()

  // Optional canonical URL check
  const articleCategorySlug = article.category?.slug || article.categories?.[0]?.slug
  if (articleCategorySlug && articleCategorySlug !== categorySlug) {
    console.warn(`Category mismatch: URL has "${categorySlug}" but article has "${articleCategorySlug}"`)
  }

  type ArticleComp = (p: { tenantSlug: string; title: string; article: Article; tenantDomain?: string }) => ReactElement | Promise<ReactElement>
  const Comp = (await getThemeArticle(tenant.themeKey)) as ArticleComp

  return <Comp tenantSlug={tenant.slug} title={tenant.name} article={article} tenantDomain={tenant.domain || undefined} />
}

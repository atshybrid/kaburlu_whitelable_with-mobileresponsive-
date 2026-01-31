/**
 * SEO-Friendly Article Page for Domain-based Multitenancy
 * 
 * URL: /[slug]/[articleSlug]
 * Example: kaburlutoday.com/politics/kukatpally-development-discussions-bandi-ramesh
 * 
 * ✅ SEO-optimized URL structure: /{category}/{article-slug}
 * ✅ Better for search engine rankings
 * ✅ Supports both Style1 and Style2 themes
 * ✅ Full metadata support
 * 
 * Note: We use [slug] for category to match the (legal) route group parameter naming
 */

import { getArticleBySlug } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain, getEffectiveSettingsForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { notFound } from 'next/navigation'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'
import type { Metadata } from 'next'

// Force dynamic rendering for domain-based multitenancy
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Reserved slugs that should NOT be treated as category slugs
const RESERVED_SLUGS = [
  'article',
  'category', 
  'api',
  't',
  'search',
  'about',
  'contact',
  'privacy-policy',
  'terms',
  'sitemap',
  'robots',
  'favicon',
  '_next',
  'static',
]

// Helper functions for metadata extraction
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
  params: Promise<{ slug: string; articleSlug: string }>
}): Promise<Metadata> {
  const { slug: categorySlug, articleSlug } = await params
  
  // Skip reserved slugs
  if (RESERVED_SLUGS.includes(categorySlug.toLowerCase())) {
    return { title: 'Not Found' }
  }
  
  // Resolve tenant from domain header
  const tenant = await resolveTenant()
  const domain = tenant.domain || 'localhost'
  
  const article = await getArticleBySlug(tenant.id, articleSlug)
  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }
  
  const a = article as Record<string, unknown>
  
  // Get settings for publisher info
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
  
  // Prefer explicit SEO fields from backend if present
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
  
  // Priority: coverImageUrl (new API), then coverImage.url (legacy), then other fields
  const image = pickFirstString(
    a.coverImageUrl,
    pickFrom(a, ['coverImage', 'url']),
    a.imageUrl,
    a.featuredImage,
    a.image
  )
  
  // SEO-friendly canonical URL: /{categorySlug}/{articleSlug}
  const url = `${canonicalBase}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`
  
  const createdAt = pickString(a.publishedAt) || pickString(a.createdAt)
  const updatedAt = pickString(a.updatedAt) || createdAt
  
  // Extract category for article:section
  const categoryName = pickFirstString(
    pickFrom(a, ['category', 'name']),
    pickFrom(a, ['category', 'title']),
    a.categoryName
  )
  
  // Extract author info
  const authorName = pickFirstString(
    pickFrom(a, ['author', 'name']),
    pickFrom(a, ['author', 'displayName']),
    a.authorName
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
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 675,
              alt: title,
            },
          ]
        : [],
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

export default async function SEOArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string; articleSlug: string }> 
}) {
  const { slug: categorySlug, articleSlug } = await params
  
  // Skip reserved slugs - let Next.js handle them via other routes
  if (RESERVED_SLUGS.includes(categorySlug.toLowerCase())) {
    return notFound()
  }
  
  // Resolve tenant from domain header (no tenant param needed)
  const tenant = await resolveTenant()
  
  // Handle domain not linked case
  if (tenant.isDomainNotLinked) {
    return <DomainNotLinked domain={tenant.domain || 'unknown'} />
  }
  
  // Handle API error case
  if (tenant.isApiError) {
    return (
      <TechnicalIssues 
        title="Technical Issues"
        message="We're experiencing technical difficulties with our API services. Please contact Kaburlu Media support."
      />
    )
  }
  
  // Additional domain settings check
  if (tenant.domain) {
    const settingsResult = await getSettingsResultForDomain(tenant.domain)
    
    if (settingsResult.isDomainNotLinked) {
      return <DomainNotLinked domain={tenant.domain} />
    }
    
    if (settingsResult.isApiError) {
      return (
        <TechnicalIssues 
          title="Technical Issues"
          message="We're experiencing technical difficulties with our API services. Please contact Kaburlu Media support."
        />
      )
    }
  }
  
  // Fetch article by articleSlug (category is used for SEO URL, article is fetched by slug)
  const article = await getArticleBySlug(tenant.id, articleSlug)
  if (!article) return notFound()
  
  // Optional: Verify category matches (for SEO correctness)
  const articleCategorySlug = article.category?.slug || article.categories?.[0]?.slug
  if (articleCategorySlug && articleCategorySlug !== categorySlug) {
    // Category mismatch - you could redirect to correct URL here
    // For now, we still show the article (backend is source of truth)
    console.warn(`Category mismatch: URL has "${categorySlug}" but article has "${articleCategorySlug}"`)
  }

  // Get theme-specific article component
  type ArticleComp = (p: { tenantSlug: string; title: string; article: Article; tenantDomain?: string }) => ReactElement | Promise<ReactElement>
  const Comp = (await getThemeArticle(tenant.themeKey)) as ArticleComp

  return <Comp tenantSlug={tenant.slug} title={tenant.name} article={article} tenantDomain={tenant.domain || undefined} />
}

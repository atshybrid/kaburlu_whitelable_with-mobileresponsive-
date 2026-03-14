/**
 * Category Page for Domain-based Multitenancy
 * 
 * URL: /category/[slug]
 * Example: aksharamvoice.com/category/crime
 * 
 * ✅ Supports both Style1 and Style2 themes
 * ✅ SEO optimized with full metadata
 */

import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain, getEffectiveSettingsForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { ArticleGrid } from '@/components/shared/ArticleGrid'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { getArticlesByCategory } from '@/lib/data'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { categoryHref } from '@/lib/url'

// Force dynamic rendering for domain-based multitenancy
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper for string extraction
function pickString(v: unknown) {
  const s = String(v ?? '').trim()
  return s || undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  
  // Resolve tenant from domain header
  const tenant = await resolveTenant()
  const domain = tenant.domain || 'localhost'
  
  const categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  
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
  
  const title = `${categoryName} News - ${publisherName}`
  const description = `Latest ${categoryName} news and updates from ${publisherName}. Stay informed with breaking news, in-depth coverage, and expert analysis.`
  
  // SEO-friendly canonical URL for domain mode
  const url = `${canonicalBase}/category/${encodeURIComponent(slug)}`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: publisherName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  }
}

async function getThemeCategory(themeKey: string) {
  switch (themeKey) {
    case 'style2':
      // Check if style2 has ThemeCategory
      const style2 = await import('@/themes/style2')
      return (style2 as { ThemeCategory?: unknown }).ThemeCategory || null
    case 'toi':
      return (await import('@/themes/toi')).ThemeCategory
    default:
      return null
  }
}

const CATEGORY_PAGE_SIZE = 12

function parsePage(queryPage: string | string[] | undefined) {
  const raw = Array.isArray(queryPage) ? queryPage[0] : queryPage
  const num = Number(raw)
  if (!Number.isFinite(num) || num < 1) return 1
  return Math.floor(num)
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const sp = searchParams ? await searchParams : undefined
  const currentPage = parsePage(sp?.page)
  
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
  
  // Fetch articles for this category
  const pagedArticles = await getArticlesByCategory(tenant.id, slug, {
    page: currentPage,
    pageSize: CATEGORY_PAGE_SIZE + 1,
  })
  const hasNextPage = pagedArticles.length > CATEGORY_PAGE_SIZE
  const hasPrevPage = currentPage > 1
  const articles = hasNextPage ? pagedArticles.slice(0, CATEGORY_PAGE_SIZE) : pagedArticles
  const categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  // Use theme-specific category page if available
  type CategoryComp = (p: {
    tenantSlug: string
    title: string
    categorySlug: string
    categoryName: string
    articles: Article[]
    tenantDomain?: string
    currentPage?: number
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }) => ReactElement | Promise<ReactElement>
  const ThemeCategory = await getThemeCategory(tenant.themeKey) as CategoryComp | null

  if (ThemeCategory) {
    return (
      <ThemeCategory
        tenantSlug={tenant.slug}
        title={tenant.name}
        categorySlug={slug}
        categoryName={categoryName}
        articles={articles}
        tenantDomain={tenant.domain || undefined}
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    )
  }

  // Default fallback category page (works for style1)
  return (
    <div className="theme-style1 min-h-screen bg-zinc-50">
      <Navbar tenantSlug={tenant.slug} title={tenant.name} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900">{categoryName}</h1>
          <p className="mt-2 text-zinc-600">Latest news and updates in {categoryName}</p>
        </div>
        <ArticleGrid tenantSlug={tenant.slug} items={articles} />
        {(hasPrevPage || hasNextPage) && (
          <div className="mt-8 flex items-center justify-center gap-3">
            {hasPrevPage ? (
              <Link
                href={`${categoryHref(tenant.slug, slug)}?page=${currentPage - 1}`}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400"
              >
                Previous
              </Link>
            ) : (
              <span className="rounded-md border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm text-zinc-400">Previous</span>
            )}
            <span className="text-sm text-zinc-600">Page {currentPage}</span>
            {hasNextPage ? (
              <Link
                href={`${categoryHref(tenant.slug, slug)}?page=${currentPage + 1}`}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400"
              >
                Next
              </Link>
            ) : (
              <span className="rounded-md border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm text-zinc-400">Next</span>
            )}
          </div>
        )}
      </main>
      <Footer tenantSlug={tenant.slug} />
    </div>
  )
}

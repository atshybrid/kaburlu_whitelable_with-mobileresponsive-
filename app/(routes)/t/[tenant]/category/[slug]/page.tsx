import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { ArticleGrid } from '@/components/shared/ArticleGrid'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { getArticlesByCategory } from '@/lib/data'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { categoryHref } from '@/lib/url'

const CATEGORY_PAGE_SIZE = 12

function parsePage(queryPage: string | string[] | undefined) {
  const raw = Array.isArray(queryPage) ? queryPage[0] : queryPage
  const num = Number(raw)
  if (!Number.isFinite(num) || num < 1) return 1
  return Math.floor(num)
}

async function getThemeCategory(themeKey: string) {
  switch (themeKey) {
    case 'style2':
      return (await import('@/themes/style2')).ThemeCategory
    case 'toi':
      return (await import('@/themes/toi')).ThemeCategory
    default:
      return null
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string; slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { tenant: tenantSlug, slug } = await params
  const sp = searchParams ? await searchParams : undefined
  const currentPage = parsePage(sp?.page)
  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  
  // Check domain settings for this tenant
  if (tenant.domain) {
    const settingsResult = await getSettingsResultForDomain(tenant.domain)
    
    // Handle domain not linked case
    if (settingsResult.isDomainNotLinked) {
      return <DomainNotLinked domain={tenant.domain} />
    }
    
    // Handle API error case
    if (settingsResult.isApiError) {
      return (
        <TechnicalIssues 
          title="Technical Issues"
          message="We're experiencing technical difficulties with our API services. Please contact Kaburlu Media support."
        />
      )
    }
  }
  
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
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    )
  }

  // Default fallback category page
  return (
    <div>
      <Navbar tenantSlug={tenant.slug} title={tenant.name} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">{categoryName}</h1>
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
      <Footer />
    </div>
  )
}

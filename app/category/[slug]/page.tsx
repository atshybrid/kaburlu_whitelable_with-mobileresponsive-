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

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
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
  const articles = await getArticlesByCategory(tenant.id, slug)
  const categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  // Use theme-specific category page if available
  type CategoryComp = (p: { tenantSlug: string; title: string; categorySlug: string; categoryName: string; articles: Article[]; tenantDomain?: string }) => ReactElement | Promise<ReactElement>
  const ThemeCategory = await getThemeCategory(tenant.themeKey) as CategoryComp | null

  if (ThemeCategory) {
    return <ThemeCategory tenantSlug={tenant.slug} title={tenant.name} categorySlug={slug} categoryName={categoryName} articles={articles} tenantDomain={tenant.domain || undefined} />
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
      </main>
      <Footer tenantSlug={tenant.slug} />
    </div>
  )
}

import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { ArticleGrid } from '@/components/shared/ArticleGrid'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { getArticlesByCategory } from '@/lib/data'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'

async function getThemeCategory(themeKey: string) {
  switch (themeKey) {
    case 'toi':
      return (await import('@/themes/toi')).ThemeCategory
    default:
      return null
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant: tenantSlug, slug } = await params
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
  
  const articles = await getArticlesByCategory(tenant.id, slug)
  const categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  // Use theme-specific category page if available
  type CategoryComp = (p: { tenantSlug: string; title: string; categorySlug: string; categoryName: string; articles: Article[] }) => ReactElement | Promise<ReactElement>
  const ThemeCategory = await getThemeCategory(tenant.themeKey) as CategoryComp | null

  if (ThemeCategory) {
    return <ThemeCategory tenantSlug={tenant.slug} title={tenant.name} categorySlug={slug} categoryName={categoryName} articles={articles} />
  }

  // Default fallback category page
  return (
    <div>
      <Navbar tenantSlug={tenant.slug} title={tenant.name} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">{categoryName}</h1>
        <ArticleGrid tenantSlug={tenant.slug} items={articles} />
      </main>
      <Footer />
    </div>
  )
}

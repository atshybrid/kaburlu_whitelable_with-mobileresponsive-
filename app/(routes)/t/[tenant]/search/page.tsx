import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { ArticleGrid } from '@/components/shared/ArticleGrid'
import { getHomeFeed } from '@/lib/data'

export default async function SearchPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { tenant: tenantSlug } = await params
  const { q: query } = await searchParams
  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  
  // Check domain settings for this tenant
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
  
  // TODO: Implement actual search API call
  // For now, showing latest articles as placeholder
  const articles = await getHomeFeed(tenant.id)
  const searchQuery = query || ''

  return (
    <div>
      <Navbar tenantSlug={tenant.slug} title={tenant.name} />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Search'}
          </h1>
          {searchQuery && (
            <p className="text-zinc-600">
              Found {articles.length} results
            </p>
          )}
        </div>
        
        {searchQuery ? (
          articles.length > 0 ? (
            <ArticleGrid tenantSlug={tenant.slug} items={articles} />
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-zinc-900 mb-2">No results found</h2>
              <p className="text-zinc-600">Try different keywords or check your spelling</p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Start your search</h2>
            <p className="text-zinc-600">Enter keywords above to find articles</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

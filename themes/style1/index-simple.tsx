import { Footer, TechnicalIssues } from '@/components/shared'
import { Navbar } from '@/components/shared/Navbar'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import Link from 'next/link'
import type { UrlObject } from 'url'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import { articleHref, categoryHref } from '@/lib/url'
import { getCategoriesForNav } from '@/lib/categories'
import { getArticlesByCategory, getHomeFeed } from '@/lib/data'
import MobileBottomNav from '@/components/shared/MobileBottomNav'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

// Helper components
function HeroFeatured({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={a.coverImage.url} 
            alt={a.title} 
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
            loading="eager"
          />
        ) : (
          <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Link 
            href={toHref(articleHref(tenantSlug, a.slug || a.id))} 
            className="block text-2xl sm:text-3xl font-medium leading-tight text-white line-clamp-3 drop-shadow-lg hover:text-red-300 transition-colors"
          >
            {a.title}
          </Link>
          {a.excerpt && (
            <p className="mt-3 text-sm text-white/90 line-clamp-2 leading-relaxed">
              {a.excerpt}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

function HeroSmallCard({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="flex gap-3 p-3">
        <div className="relative w-24 h-20 flex-shrink-0 rounded overflow-hidden">
          {a.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={a.coverImage.url} 
              alt={a.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" 
              loading="lazy"
            />
          ) : (
            <PlaceholderImg className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium line-clamp-3 group-hover:text-red-600 transition-colors">
            {a.title}
          </h3>
        </div>
      </Link>
    </article>
  )
}

function HeroCard({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={a.coverImage.url} 
            alt={a.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" 
            loading="lazy"
          />
        ) : (
          <PlaceholderImg className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <Link 
        href={toHref(articleHref(tenantSlug, a.slug || a.id))}
        className="block p-3 text-sm font-medium line-clamp-2 group-hover:text-red-600 transition-colors"
      >
        {a.title}
      </Link>
    </article>
  )
}

function CategoryCard({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-zinc-100">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={a.coverImage.url} 
            alt={a.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" 
            loading="lazy"
          />
        ) : (
          <PlaceholderImg className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <Link 
        href={toHref(articleHref(tenantSlug, a.slug || a.id))}
        className="block p-3 text-sm font-medium line-clamp-3 group-hover:text-red-600 transition-colors"
      >
        {a.title}
      </Link>
    </article>
  )
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200">
      <div className="inline-flex items-center gap-2">
        <span className="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
        <h2 className="text-lg font-medium uppercase tracking-wide text-zinc-900">{title}</h2>
      </div>
      {href && (
        <Link
          href={toHref(href)}
          className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
        >
          View All →
        </Link>
      )}
    </div>
  )
}

/* ==================== MAIN THEME HOME COMPONENT ==================== */

export async function ThemeHome({
  tenantSlug,
  title,
  settings,
}: {
  tenantSlug: string
  title: string
  articles?: Article[]
  settings?: EffectiveSettings
  tenantDomain?: string
}) {
  // Fetch latest 13 articles for hero section
  const allArticles = await getHomeFeed('na')
  const heroArticles = allArticles.slice(0, 13)
  
  if (heroArticles.length === 0) {
    return (
      <div className="theme-style1 min-h-screen bg-zinc-50">
        <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <TechnicalIssues 
            title="No Content Available"
            message="We're currently updating our content. Please check back later."
          />
        </div>
        <Footer settings={settings} tenantSlug={tenantSlug} />
      </div>
    )
  }

  const featured = heroArticles[0]
  const column1Articles = heroArticles.slice(1, 7)  // 6 articles
  const column2Articles = heroArticles.slice(7, 13) // 6 articles

  // Fetch categories for category sections
  const categories = await getCategoriesForNav()
  const displayCategories = categories.slice(0, 5) // Show first 5 categories

  // Fetch articles for each category
  const categoryArticlesMap: Record<string, Article[]> = {}
  for (const cat of displayCategories) {
    try {
      const catArticles = await getArticlesByCategory('na', cat.slug)
      categoryArticlesMap[cat.slug] = catArticles.slice(0, 10)
    } catch {
      categoryArticlesMap[cat.slug] = []
    }
  }

  return (
    <div className="theme-style1 min-h-screen bg-zinc-50">
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />
      
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Hero Section - 1 Featured + 12 Articles in 2 Columns */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Article - Spans 2 columns on large screens */}
            <div className="lg:col-span-2">
              <HeroFeatured tenantSlug={tenantSlug} a={featured} />
            </div>
            
            {/* Column 1 - 6 Small Cards */}
            <div className="space-y-4">
              {column1Articles.map((a) => (
                <HeroSmallCard key={a.id} tenantSlug={tenantSlug} a={a} />
              ))}
            </div>
          </div>
          
          {/* Column 2 - 6 Cards (Below featured on mobile, grid on large screens) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {column2Articles.map((a) => (
              <HeroCard key={a.id} tenantSlug={tenantSlug} a={a} />
            ))}
          </div>
        </section>

        {/* Category Sections */}
        {displayCategories.map((cat) => {
          const catArticles = categoryArticlesMap[cat.slug] || []
          if (catArticles.length === 0) return null

          return (
            <section key={cat.id} className="mb-8 bg-white rounded-xl p-6 shadow-sm">
              <SectionHeader 
                title={cat.name}
                href={categoryHref(tenantSlug, cat.slug)}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {catArticles.map((a) => (
                  <CategoryCard key={a.id} tenantSlug={tenantSlug} a={a} />
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <Footer settings={settings} tenantSlug={tenantSlug} />
      <MobileBottomNav tenantSlug={tenantSlug} />
    </div>
  )
}

/* ==================== THEME ARTICLE COMPONENT (Keep existing) ==================== */
export { ThemeArticle } from './index'

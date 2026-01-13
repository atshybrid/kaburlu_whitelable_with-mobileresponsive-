import { Footer, TechnicalIssues, SectionError, EmptyState } from '@/components/shared'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import type { ReactNode } from 'react'
import Link from 'next/link'
import type { UrlObject } from 'url'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import { articleHref, categoryHref, homeHref } from '@/lib/url'
import { getCategoriesForNav, type Category } from '@/lib/categories'
import { getArticlesByCategory, getHomeFeed } from '@/lib/data'
import { getEffectiveSettings } from '@/lib/settings'
import { getPublicHomepage, type NewHomepageResponse, feedItemsToArticles } from '@/lib/homepage'
import { TOINavbar } from '@/themes/toi/components/TOINavbar'
import { TOITicker } from '@/themes/toi/components/TOITicker'
import { TOIMobileNav } from '@/themes/toi/components/TOIMobileNav'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

// ============================================
// Hero Feature Card - Main
// ============================================
function HeroFeatureMain({ tenantSlug, article, category }: { tenantSlug: string; article: Article; category?: string }) {
  return (
    <Link 
      href={toHref(articleHref(tenantSlug, article.slug || article.id))} 
      className="toi-feature-main group block"
    >
      <div className="toi-feature-img">
        {article.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage.url} alt={article.title} loading="eager" />
        ) : (
          <PlaceholderImg className="w-full h-full object-cover" />
        )}
        <div className="toi-feature-overlay">
          {category && <span className="toi-feature-category">{category}</span>}
          <h2 className="toi-feature-title toi-headline">{article.title}</h2>
          <div className="toi-feature-meta">
            <span>📰 Breaking News</span>
            <span>•</span>
            <span>Just Now</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ============================================
// Secondary Card
// ============================================
function SecondaryCard({ tenantSlug, article }: { tenantSlug: string; article: Article }) {
  return (
    <Link 
      href={toHref(articleHref(tenantSlug, article.slug || article.id))} 
      className="toi-card group block"
    >
      <div className="toi-card-img">
        {article.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage.url} alt={article.title} loading="lazy" />
        ) : (
          <PlaceholderImg className="w-full h-full object-cover" />
        )}
      </div>
      <div className="toi-card-body">
        <h3 className="toi-card-title toi-headline">{article.title}</h3>
        {article.excerpt && (
          <p className="toi-card-excerpt">{article.excerpt}</p>
        )}
      </div>
    </Link>
  )
}

// ============================================
// List Item
// ============================================
function ListItem({ tenantSlug, article, showThumb = true }: { tenantSlug: string; article: Article; showThumb?: boolean }) {
  return (
    <Link 
      href={toHref(articleHref(tenantSlug, article.slug || article.id))} 
      className="toi-list-item group"
    >
      <div className="toi-list-content">
        <h4 className="toi-list-title toi-headline">{article.title}</h4>
        <span className="toi-list-meta">2 hours ago</span>
      </div>
      {showThumb && (
        <div className="toi-list-thumb">
          {article.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.coverImage.url} alt={article.title} loading="lazy" />
          ) : (
            <PlaceholderImg className="w-full h-full object-cover" />
          )}
        </div>
      )}
    </Link>
  )
}

// ============================================
// Section Header
// ============================================
function SectionHeader({ title, viewMoreHref }: { title: string; viewMoreHref?: string }) {
  return (
    <div className="toi-section-header">
      <h2 className="toi-section-title toi-headline">{title}</h2>
      {viewMoreHref && (
        <Link href={toHref(viewMoreHref)} className="toi-view-more">
          View More
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      )}
    </div>
  )
}

// ============================================
// Trending Widget (Sidebar)
// ============================================
function TrendingWidget({ tenantSlug, articles }: { tenantSlug: string; articles: Article[] }) {
  return (
    <div className="toi-widget">
      <div className="toi-widget-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <span className="toi-widget-title">Trending Now</span>
      </div>
      <div className="toi-widget-body">
        {articles.slice(0, 8).map((article, idx) => (
          <Link 
            key={article.id}
            href={toHref(articleHref(tenantSlug, article.slug || article.id))}
            className="toi-trending-item group"
          >
            <span className="toi-trending-num">{idx + 1}</span>
            <span className="toi-trending-title toi-headline">{article.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Latest News Widget (Sidebar)
// ============================================
function LatestNewsWidget({ tenantSlug, articles }: { tenantSlug: string; articles: Article[] }) {
  return (
    <div className="toi-widget">
      <div className="toi-widget-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span className="toi-widget-title">Latest News</span>
      </div>
      <div className="toi-widget-body p-0">
        {articles.slice(0, 5).map((article) => (
          <ListItem key={article.id} tenantSlug={tenantSlug} article={article} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Ad Placeholders
// ============================================
function HorizontalAd({ label = '728×90' }: { label?: string }) {
  return (
    <div className="toi-ad toi-ad-horizontal">
      <span>Ad {label}</span>
    </div>
  )
}

function SidebarAd({ size = '300×250' }: { size?: string }) {
  return (
    <div className="toi-ad toi-ad-sidebar">
      <span>Ad {size}</span>
    </div>
  )
}

// ============================================
// Category List Section
// ============================================
function CategoryListSection({ 
  tenantSlug, 
  title, 
  articles, 
  viewMoreHref 
}: { 
  tenantSlug: string; 
  title: string; 
  articles: Article[]; 
  viewMoreHref?: string 
}) {
  if (articles.length === 0) return null
  
  return (
    <div className="toi-widget">
      <div className="toi-widget-header">
        <span className="toi-widget-title">{title}</span>
        {viewMoreHref && (
          <Link href={toHref(viewMoreHref)} className="ml-auto text-white/70 text-xs hover:text-white">
            View More →
          </Link>
        )}
      </div>
      <div className="toi-widget-body p-0">
        {articles.slice(0, 6).map((article) => (
          <ListItem key={article.id} tenantSlug={tenantSlug} article={article} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Two Column Category Grid
// ============================================
async function CategoryColumnsGrid({ tenantSlug }: { tenantSlug: string }) {
  let hasError = false
  let categoriesData: Array<{category: Category; articles: Article[]}> = []
  let shouldShowEmpty = false
  
  try {
    const cats = await getCategoriesForNav()
    const topCats = cats.filter(c => !c.parentId).slice(0, 4)
    
    if (topCats.length === 0) {
      shouldShowEmpty = true
    } else {
      categoriesData = await Promise.all(
        topCats.map(async (cat) => {
          try {
            const articles = await getArticlesByCategory('na', cat.slug)
            return { category: cat, articles: articles.slice(0, 4) }
          } catch {
            return { category: cat, articles: [] }
          }
        })
      )
    }
  } catch {
    hasError = true
  }
  
  if (hasError) {
    return (
      <section className="toi-section">
        <SectionError 
          title="Unable to load categories"
          className="my-8"
        />
      </section>
    )
  }
  
  if (shouldShowEmpty) {
    return (
      <section className="toi-section">
        <EmptyState 
          title="No categories available" 
          message="Categories will appear here when they become available."
          className="my-8"
        />
      </section>
    )
  }
  
  return (
    <section className="toi-section">
      <div className="toi-grid-2">
        {categoriesData.map(({ category, articles }) => (
          <CategoryListSection
            key={category.id}
            tenantSlug={tenantSlug}
            title={category.name}
            articles={articles}
            viewMoreHref={categoryHref(tenantSlug, category.slug)}
          />
        ))}
      </div>
    </section>
  )
}

// ============================================
// Related Articles
// ============================================
async function RelatedArticles({ tenantSlug, article }: { tenantSlug: string; article: Article }) {
  let hasError = false
  let related: Article[] = []
  
  try {
    const feed = await getHomeFeed('na')
    related = feed.filter((a) => a.id !== article.id).slice(0, 6)
  } catch {
    hasError = true
  }
  
  if (hasError) {
    return (
      <SectionError 
        title="Unable to load related articles"
      />
    )
  }
  
  if (related.length === 0) {
    return (
      <EmptyState 
        title="No related articles available" 
        message="Related articles will appear here when available."
      />
    )
  }
  
  return (
    <>
      {related.map((a) => (
        <SecondaryCard key={a.id} tenantSlug={tenantSlug} article={a} />
      ))}
    </>
  )
}

// ============================================
// Latest Articles Sidebar
// ============================================
async function LatestArticlesSidebar({ tenantSlug }: { tenantSlug: string }) {
  let hasError = false
  let items: Article[] = []
  
  try {
    items = await getHomeFeed('na')
  } catch {
    hasError = true
  }
  
  if (hasError) {
    return (
      <div className="toi-widget">
        <div className="toi-widget-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span className="toi-widget-title">Latest News</span>
        </div>
        <div className="toi-widget-body">
          <SectionError title="Unable to load latest news" />
        </div>
      </div>
    )
  }
  
  if (items.length === 0) {
    return (
      <div className="toi-widget">
        <div className="toi-widget-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span className="toi-widget-title">Latest News</span>
        </div>
        <div className="toi-widget-body">
          <EmptyState 
            title="No latest news available" 
            message="Latest news will appear here when available."
          />
        </div>
      </div>
    )
  }
  
  return <LatestNewsWidget tenantSlug={tenantSlug} articles={items.slice(0, 8)} />
}

// ============================================
// Trending Articles Sidebar (Most Read)
// ============================================
function TrendingArticlesSidebar({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  if (items.length === 0) {
    return (
      <div className="toi-widget">
        <div className="toi-widget-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span className="toi-widget-title">Most Read</span>
        </div>
        <div className="toi-widget-body">
          <EmptyState 
            title="No trending articles available" 
            message="Trending articles will appear here when available."
          />
        </div>
      </div>
    )
  }
  
  return <TrendingWidget tenantSlug={tenantSlug} articles={items.slice(0, 8)} />
}

// ============================================
// Inline Ad for Articles
// ============================================
function InlineAd() {
  return (
    <div className="toi-ad toi-ad-horizontal my-8">
      <span>Inline Ad 728×90</span>
    </div>
  )
}

// ============================================
// Article Content with Interleaved Ads
// ============================================
function InterleavedArticle({ html }: { html: string }) {
  if (!html) return null
  
  const parts = html.split(/<\/p>/i)
  const every = 3 // Ad every 3 paragraphs
  const nodes: ReactNode[] = []
  let paraIndex = 0
  
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i]
    if (chunk.trim().length === 0) continue
    const closed = chunk.endsWith('</p>') ? chunk : chunk + '</p>'
    nodes.push(
      <div key={`p-${i}`} className="toi-article-content" dangerouslySetInnerHTML={{ __html: closed }} />
    )
    paraIndex++
    if (paraIndex % every === 0 && i < parts.length - 1) {
      nodes.push(<InlineAd key={`ad-${i}`} />)
    }
  }
  
  return <>{nodes}</>
}

// ============================================
// Main Theme Home Component
// ============================================
export async function ThemeHome({
  tenantSlug,
  title,
  articles,
  settings,
}: {
  tenantSlug: string
  title: string
  articles: Article[]
  settings?: EffectiveSettings
}) {
  // If no articles provided, show technical issues
  if (!articles || articles.length === 0) {
    return (
      <div className="theme-toi">
        <TOINavbar 
          tenantSlug={tenantSlug} 
          title={title} 
          logoUrl={settings?.branding?.logoUrl} 
        />
        <TechnicalIssues 
          title="Technical Issues"
          message="We're experiencing technical difficulties with our content delivery. Please contact Kaburlu Media support."
        />
        <Footer settings={settings} tenantSlug={tenantSlug} />
      </div>
    )
  }

  let homepage: NewHomepageResponse | null = null
  try {
    const lang = settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'en'
    homepage = await getPublicHomepage({ v: 1, themeKey: 'toi', lang })
  } catch {
    homepage = null
  }

  const tenantSlugForLinks = homepage?.tenant?.slug || tenantSlug
  
  // Extract feeds from the new API structure
  const feeds = homepage?.feeds || {}
  
  // Smart section data extraction using feeds
  const latestItems = feeds.latest?.items ? feedItemsToArticles(feeds.latest.items) : []
  const tickerItems = feeds.ticker?.items ? feedItemsToArticles(feeds.ticker.items) : []
  const mostReadItems = feeds.mostRead?.items ? feedItemsToArticles(feeds.mostRead.items).slice(0, 3) : []
  
  // Use smart API data with fallbacks
  const tickerData = tickerItems.length > 0 ? tickerItems : articles.slice(0, 10)
  const latestData = latestItems.length > 0 ? latestItems : articles
  const mostReadData = mostReadItems.length > 0 ? mostReadItems : articles.slice(0, 3)

  const heroItems = latestData
  const lastNewsItems = latestData

  // Ensure we have at least one main feature article
  if (heroItems.length === 0) {
    return (
      <div className="theme-toi">
        <TOINavbar 
          tenantSlug={tenantSlugForLinks} 
          title={title} 
          logoUrl={settings?.branding?.logoUrl} 
        />
        <TechnicalIssues 
          title="No Content Available"
          message="We're unable to load content at this time. Please contact Kaburlu Media support."
        />
        <Footer settings={settings} tenantSlug={tenantSlugForLinks} />
      </div>
    )
  }

  const mainFeature = heroItems[0]
  const secondaryFeatures = heroItems.slice(1, 5)

  return (
    <div className="theme-toi">
      {/* Header */}
      <TOINavbar 
        tenantSlug={tenantSlugForLinks} 
        title={title} 
        logoUrl={settings?.branding?.logoUrl} 
      />

      {/* Breaking News Ticker */}
      <TOITicker tenantSlug={tenantSlugForLinks} items={tickerData} />

      {/* Hero Section */}
      <section className="toi-section">
        <div className="toi-hero-grid">
          {/* Main Feature */}
          <div className="md:col-span-1 lg:row-span-2">
            {mainFeature && (
              <HeroFeatureMain 
                tenantSlug={tenantSlugForLinks} 
                article={mainFeature} 
                category="Top Story"
              />
            )}
          </div>

          {/* Secondary Features */}
          <div className="toi-feature-secondary">
            {secondaryFeatures.slice(0, 2).map((article) => (
              <SecondaryCard key={article.id} tenantSlug={tenantSlugForLinks} article={article} />
            ))}
          </div>

          {/* Third Column - More Stories */}
          <div className="toi-feature-secondary hidden lg:flex">
            {secondaryFeatures.slice(2, 4).map((article) => (
              <SecondaryCard key={article.id} tenantSlug={tenantSlugForLinks} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Ad */}
      <div className="toi-container">
        <HorizontalAd label="970×90" />
      </div>

      {/* Main Content + Sidebar */}
      <div className="toi-section">
        <div className="toi-layout-main">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Latest News List */}
            <div>
              <SectionHeader 
                title="Latest News" 
                viewMoreHref={homeHref(tenantSlugForLinks)} 
              />
              {lastNewsItems.length > 0 ? (
                <div className="toi-list">
                  {lastNewsItems.slice(0, 8).map((article) => (
                    <ListItem key={article.id} tenantSlug={tenantSlugForLinks} article={article} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No latest news available" 
                  message="Latest news will appear here when available."
                />
              )}
            </div>

            {/* Category Grid - 4 columns */}
            <div>
              <SectionHeader 
                title="More Stories" 
              />
              {heroItems.slice(5, 13).length > 0 ? (
                <div className="toi-grid-4">
                  {heroItems.slice(5, 13).map((article) => (
                    <SecondaryCard key={article.id} tenantSlug={tenantSlugForLinks} article={article} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No more stories available" 
                  message="More stories will appear here when available."
                />
              )}
            </div>

            {/* Horizontal Ad */}
            <HorizontalAd />

            {/* Category Sections */}
            <CategoryColumnsGrid tenantSlug={tenantSlugForLinks} />
          </div>

          {/* Sidebar */}
          <aside className="toi-sidebar hidden lg:flex">
            <SidebarAd />
            <TrendingArticlesSidebar tenantSlug={tenantSlugForLinks} items={mostReadData} />
            <SidebarAd size="300×600" />
            <LatestArticlesSidebar tenantSlug={tenantSlugForLinks} />
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <TOIMobileNav tenantSlug={tenantSlugForLinks} />

      {/* Footer */}
      <Footer settings={settings} tenantSlug={tenantSlugForLinks} />
    </div>
  )
}

// ============================================
// Article Page Component
// ============================================
export async function ThemeArticle({ 
  tenantSlug, 
  title, 
  article 
}: { 
  tenantSlug: string; 
  title: string; 
  article: Article 
}) {
  const settings = await getEffectiveSettings()
  
  // Fetch most read data for sidebar
  let mostReadData: Article[] = []
  try {
    const homepage = await getPublicHomepage({ v: 1, themeKey: 'toi', lang: 'en' })
    const feeds = homepage?.feeds || {}
    mostReadData = feeds.mostRead?.items ? feedItemsToArticles(feeds.mostRead.items).slice(0, 5) : []
  } catch {
    // Use fallback data
    try {
      const articles = await getHomeFeed('na')
      mostReadData = articles.slice(0, 5)
    } catch {
      mostReadData = []
    }
  }
  
  return (
    <div className="theme-toi">
      <TOINavbar 
        tenantSlug={tenantSlug} 
        title={title} 
        logoUrl={settings?.branding?.logoUrl} 
      />

      {/* Article Content */}
      <div className="toi-section">
        <div className="toi-layout-main">
          {/* Main Article */}
          <article className="toi-article mx-0 p-0">
            {/* Breadcrumb */}
            <nav className="toi-article-breadcrumb">
              <Link href={toHref(homeHref(tenantSlug))}>Home</Link>
              <span>/</span>
              <span>Article</span>
            </nav>

            {/* Article Header */}
            <header className="toi-article-header">
              <h1 className="toi-article-title toi-headline">{article.title}</h1>
              
              <div className="toi-article-meta">
                <div className="toi-article-author">
                  <div className="toi-author-avatar bg-gray-200 flex items-center justify-center text-gray-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Staff Reporter</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="toi-article-share">
                  <button className="toi-share-btn toi-share-fb" title="Share on Facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                  </button>
                  <button className="toi-share-btn toi-share-tw" title="Share on Twitter">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/>
                    </svg>
                  </button>
                  <button className="toi-share-btn toi-share-wa" title="Share on WhatsApp">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                  <button className="toi-share-btn toi-share-tg" title="Share on Telegram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {article.coverImage?.url && (
              <div className="toi-article-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.coverImage.url} alt={article.title} />
              </div>
            )}

            {/* Article Body */}
            <InterleavedArticle html={article.content ?? ''} />

            {/* Related Articles */}
            <section className="mt-12">
              <SectionHeader title="Related Articles" />
              <div className="toi-grid-3">
                <RelatedArticles tenantSlug={tenantSlug} article={article} />
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="toi-sidebar hidden lg:flex">
            <SidebarAd />
            <TrendingArticlesSidebar tenantSlug={tenantSlug} items={mostReadData} />
            <SidebarAd size="300×600" />
            <LatestArticlesSidebar tenantSlug={tenantSlug} />
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <TOIMobileNav tenantSlug={tenantSlug} />

      {/* Footer */}
      <Footer settings={settings} tenantSlug={tenantSlug} />
    </div>
  )
}

// ============================================
// Category Page Component
// ============================================
export async function ThemeCategory({
  tenantSlug,
  title,
  categoryName,
  articles,
}: {
  tenantSlug: string
  title: string
  categorySlug: string
  categoryName: string
  articles: Article[]
}) {
  const settings = await getEffectiveSettings()
  
  // Fetch most read data for sidebar
  let mostReadData: Article[] = []
  try {
    const homepage = await getPublicHomepage({ v: 1, themeKey: 'toi', lang: 'en' })
    const feeds = homepage?.feeds || {}
    mostReadData = feeds.mostRead?.items ? feedItemsToArticles(feeds.mostRead.items).slice(0, 5) : []
  } catch {
    // Use fallback data
    try {
      const articlesData = await getHomeFeed('na')
      mostReadData = articlesData.slice(0, 5)
    } catch {
      mostReadData = []
    }
  }
  
  return (
    <div className="theme-toi">
      <TOINavbar 
        tenantSlug={tenantSlug} 
        title={title} 
        logoUrl={settings?.branding?.logoUrl} 
      />

      <div className="toi-section">
        <div className="toi-layout-main">
          <div>
            {/* Category Header */}
            <div className="mb-8">
              <nav className="toi-article-breadcrumb mb-4">
                <Link href={toHref(homeHref(tenantSlug))}>Home</Link>
                <span>/</span>
                <span>{categoryName}</span>
              </nav>
              <h1 className="text-3xl font-bold toi-headline">{categoryName}</h1>
            </div>

            {/* Articles Grid */}
            <div className="toi-grid-3">
              {articles.map((article) => (
                <SecondaryCard key={article.id} tenantSlug={tenantSlug} article={article} />
              ))}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No articles found in this category.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="toi-sidebar hidden lg:flex">
            <SidebarAd />
            <TrendingArticlesSidebar tenantSlug={tenantSlug} items={mostReadData} />
            <LatestArticlesSidebar tenantSlug={tenantSlug} />
          </aside>
        </div>
      </div>

      <TOIMobileNav tenantSlug={tenantSlug} />
      <Footer settings={settings} tenantSlug={tenantSlug} />
    </div>
  )
}

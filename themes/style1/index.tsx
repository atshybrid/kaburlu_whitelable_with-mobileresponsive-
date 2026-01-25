import { Footer, TechnicalIssues, SectionError, EmptyState, ShareButtons, Breadcrumbs, ReadingProgress } from '@/components/shared'
import { Navbar } from '@/components/shared/Navbar'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import type { ReactNode } from 'react'
import Link from 'next/link'
import type { UrlObject } from 'url'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import { FlashTicker } from '@/components/shared/FlashTicker'
import { articleHref, categoryHref } from '@/lib/url'
import { getCategoriesForNav, type Category } from '@/lib/categories'
import { getArticlesByCategory, getHomeFeed } from '@/lib/data'
import { getEffectiveSettings } from '@/lib/settings'
import { getConfig } from '@/lib/config'
import { WebStoriesPlayer } from '@/components/shared/WebStoriesPlayer'
import { WebStoriesGrid } from '@/components/shared/WebStoriesGrid'
import MobileBottomNav from '@/components/shared/MobileBottomNav'
import { readHomeLayout, type HomeSection, type HomeBlock } from '@/lib/home-layout'
import { 
  getPublicHomepage, 
  getHomepageShaped,
  type NewHomepageResponse, 
  type HomepageShapedResponse,
  type HomepageShapedArticle,
  feedItemsToArticles 
} from '@/lib/homepage'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

function AdBanner({ variant = 'default', className }: { variant?: 'default' | 'tall' | 'square' | 'horizontal'; className?: string }) {
  // Map each variant to a specific gradient for consistent rendering
  const gradientMap = {
    default: 'from-blue-500 via-purple-500 to-pink-500',
    tall: 'from-green-400 via-teal-500 to-blue-500',
    square: 'from-orange-400 via-red-500 to-pink-500',
    horizontal: 'from-indigo-500 via-purple-500 to-pink-500'
  }
  
  const gradient = gradientMap[variant]
  
  const dimensions = {
    default: 'h-[250px] w-[300px]',
    tall: 'h-[600px] w-[300px]',
    square: 'h-[250px] w-[250px]',
    horizontal: 'h-24 md:h-32 lg:h-40 w-full'
  }
  
  const adSize = {
    default: '300×250',
    tall: '300×600',
    square: '250×250',
    horizontal: '728×90 / 970×250'
  }
  
  return (
    <div className={className}>
      <div className={`${dimensions[variant]} overflow-hidden rounded-xl shadow-lg relative group`}>
        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-90`} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Nmg2di02aC02em0wIDB2LTZoLTZ2Nmg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative h-full flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="mb-3">
            <svg className="w-12 h-12 mx-auto opacity-90 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-lg font-bold mb-1">Advertisement</p>
          <p className="text-xs opacity-80">{adSize[variant]}</p>
          <div className="absolute top-2 right-2">
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">Ad</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
      </div>
    </div>
  )
}

function HorizontalAd({ className, label = 'Horizontal Ad' }: { className?: string; label?: string }) {
  void label
  return <AdBanner variant="horizontal" className={className} />
}

function HeroLead({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-shadow">
      <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
          {a.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={a.coverImage.url} 
              alt={a.title} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
              loading="eager"
            />
          ) : (
            <PlaceholderImg className="h-full w-full object-cover" />
          )}
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-3">
            {a.title}
          </h2>
        </div>
      </Link>
    </article>
  )
}

function CardMedium({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow border border-zinc-100">
      <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
          {a.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={a.coverImage.url} 
              alt={a.title} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
              loading="lazy"
            />
          ) : (
            <PlaceholderImg className="h-full w-full object-cover" />
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-2">
            {a.title}
          </h3>
        </div>
      </Link>
    </article>
  )
}

function Section({ title, children, noShadow, flushBody, viewMoreHref, bodyClassName }: { title: string; children: React.ReactNode; noShadow?: boolean; flushBody?: boolean; viewMoreHref?: string; bodyClassName?: string }) {
  const hasTitle = (title ?? '').trim().length > 0
  const bodyClasses = bodyClassName ?? (flushBody ? '' : 'p-4 space-y-4')
  return (
    <section className={`mb-8 rounded-xl bg-white border border-zinc-100 ${noShadow ? '' : 'shadow-sm'}`}>
      {hasTitle && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-linear-to-r from-zinc-50 to-white">
          <div className="inline-flex items-center gap-2">
            <span className="inline-block h-6 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500 shadow-sm" />
            <span className="text-sm font-bold uppercase tracking-wide text-zinc-900">{title}</span>
          </div>
          {viewMoreHref ? (
            <a
              href={viewMoreHref}
              className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              View More →
            </a>
          ) : null}
        </div>
      )}
      <div className={bodyClasses}>{children}</div>
    </section>
  )
}

async function CategoryBlock({ tenantSlug, columnKey }: { tenantSlug: string; columnKey?: string }) {
  // Fetch data and handle errors separately
  let category: Category | null = null
  let items: Article[] = []
  let errorType: 'fetch' | 'no-category' | 'articles-fetch' | 'empty' | null = null

  try {
    const cats: Category[] = await getCategoriesForNav()
    const preferred = (process.env.NEXT_PUBLIC_LAST_NEWS_CATEGORY || '').trim().toLowerCase()
    category = preferred
      ? cats.find((c) => c.slug.toLowerCase() === preferred || c.name.toLowerCase() === preferred) || cats[0]
      : cats[0]
    
    if (!category) {
      errorType = 'no-category'
    } else {
      const rawCount = Number(process.env.NEXT_PUBLIC_LAST_NEWS_COUNT || '8')
      // Keep sections visually balanced: aim for ~7 items minimum.
      const count = Number.isFinite(rawCount) && rawCount > 0 ? Math.min(12, Math.max(7, Math.floor(rawCount))) : 7
      
      try {
        items = (await getArticlesByCategory('na', category.slug)).slice(0, count)

        // If the chosen category has too few articles, fill the remainder from latest feed
        // so the column doesn't look empty.
        if (items.length > 0 && items.length < count) {
          try {
            const feed = await getHomeFeed('na')
            const seen = new Set(items.map((a) => a.id))
            for (const a of feed) {
              if (!a || seen.has(a.id)) continue
              items.push(a)
              seen.add(a.id)
              if (items.length >= count) break
            }
          } catch {
            // ignore
          }
        }
        if (items.length === 0) {
          errorType = 'empty'
        }
      } catch {
        errorType = 'articles-fetch'
      }
    }
  } catch {
    errorType = 'fetch'
  }

  // Render based on error state
  if (errorType === 'fetch') {
    return (
      <section className="mb-8 rounded-xl bg-white">
        <div className="p-4">
          <SectionError title="Unable to load category section" />
        </div>
      </section>
    )
  }

  if (errorType === 'no-category') {
    return (
      <section className="mb-8 rounded-xl bg-white">
        <div className="p-4">
          <EmptyState 
            title="No categories available" 
            message="Categories will appear here when they become available."
          />
        </div>
      </section>
    )
  }

  if (errorType === 'articles-fetch' && category) {
    return (
      <section className="mb-8 rounded-xl bg-white">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="inline-flex items-center gap-2">
            <span className="inline-block h-5 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
            <span className="text-sm font-bold uppercase tracking-wide">{category.name}</span>
          </div>
        </div>
        <div className="p-4">
          <SectionError title="Unable to load articles" />
        </div>
      </section>
    )
  }

  if (errorType === 'empty' && category) {
    return (
      <section className="mb-8 rounded-xl bg-white">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="inline-flex items-center gap-2">
            <span className="inline-block h-5 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
            <span className="text-sm font-bold uppercase tracking-wide">{category.name}</span>
          </div>
        </div>
        <div className="p-4">
          <EmptyState 
            title="No articles available in this category" 
            message="Articles will appear here when they become available."
          />
        </div>
      </section>
    )
  }

  // Success case
  if (!category) return null
  
  const title = category.name
  const href = categoryHref(tenantSlug, category.slug)
  // Column 4 shows only 3 items, other columns show 7
  const itemCount = columnKey === 'col-4' ? 3 : 7

  return (
    <section className="mb-8 rounded-xl bg-white">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="inline-flex items-center gap-2">
          <span className="inline-block h-5 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
          {href ? (
            <a href={href} className="text-sm font-bold uppercase tracking-wide hover:text-red-600">
              {title}
            </a>
          ) : (
            <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
          )}
        </div>
        {href ? (
          <a href={href} className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50">
            View More →
          </a>
        ) : null}
      </div>
      <div>
        {items.slice(0, itemCount).map((a) => (
          <div
            key={a.id}
            className="grid grid-cols-[1fr_auto] items-center gap-[0.725rem] px-[0.725rem] py-[0.725rem] border-b border-dashed border-zinc-200 last:border-b-0"
          >
            <a
              href={articleHref(tenantSlug, a.slug || a.id)}
              className="line-clamp-2 text-sm font-semibold leading-tight hover:text-red-600"
            >
              {a.title}
            </a>
            <div className="h-17 w-25 overflow-hidden rounded">
              {a.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
              ) : (
                <PlaceholderImg className="h-full w-full object-cover" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ListRow({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group border-b border-zinc-100 last:border-0">
      <Link 
        href={toHref(articleHref(tenantSlug, a.slug || a.id))}
        className="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5 hover:bg-zinc-50 transition-colors"
      >
        <h4 className="text-sm font-semibold text-zinc-800 group-hover:text-red-600 transition-colors line-clamp-2">
          {a.title}
        </h4>
        <div className="h-14 w-20 overflow-hidden rounded shrink-0 bg-zinc-100">
          {a.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={a.coverImage.url} 
              alt={a.title} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
              loading="lazy"
            />
          ) : (
            <PlaceholderImg className="h-full w-full object-cover" />
          )}
        </div>
      </Link>
    </article>
  )
}

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
  tenantDomain?: string
}) {
  const baseArticles: Article[] = Array.isArray(articles) ? articles : []

  // Determine the API version based on theme setting
  const themeKey = settings?.theme?.theme || settings?.theme?.key || 'style1'
  const lang = settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'te'

  // Helper to convert shaped articles to Article format
  const shapedToArticle = (item: HomepageShapedArticle): Article => ({
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    excerpt: item.excerpt || '',
    coverImage: item.coverImageUrl ? { url: item.coverImageUrl } : undefined,
    publishedAt: item.publishedAt || new Date().toISOString(),
    categories: item.category
      ? [{ slug: item.category.slug, name: item.category.name }]
      : undefined,
    author: { name: 'కబుర్లు డెస్క్' },
    content: '',
  })

  // Fetch shaped homepage with structured sections
  let shapedHomepage: HomepageShapedResponse | null = null
  try {
    shapedHomepage = await getHomepageShaped({ themeKey, lang })
    console.log('✅ Shaped homepage loaded:', {
      hasHero: !!shapedHomepage?.hero,
      hasTopStories: !!shapedHomepage?.topStories,
      sectionsCount: shapedHomepage?.sections?.length || 0,
      dataKeys: Object.keys(shapedHomepage?.data || {}),
    })
  } catch (error) {
    console.error('❌ Shaped homepage failed:', error)
    shapedHomepage = null
  }

  // Also fetch legacy homepage for ticker and tenant info
  let homepage: NewHomepageResponse | null = null
  try {
    const apiVersion = themeKey === 'style2' ? '2' : '1'
    homepage = await getPublicHomepage({ v: apiVersion, themeKey, lang })
  } catch {
    homepage = null
  }

  // Best-practice: for root-domain home, use the tenant slug returned by backend homepage config
  // so links go to the correct tenant path.
  const tenantSlugForLinks = homepage?.tenant?.slug || tenantSlug

  // Extract feeds from the legacy API for ticker and mostRead
  const feeds = homepage?.feeds || {}
  const tickerItems = feeds.ticker?.items ? feedItemsToArticles(feeds.ticker.items) : []
  const mostReadItems = feeds.mostRead?.items ? feedItemsToArticles(feeds.mostRead.items).slice(0, 3) : []
  
  // Use ticker from API or fallback to articles
  const shapedFallbackFeed: Article[] = shapedHomepage
    ? [...(shapedHomepage.hero || []), ...(shapedHomepage.topStories || [])].map(shapedToArticle)
    : []

  const fallbackFeed = baseArticles.length > 0 ? baseArticles : shapedFallbackFeed
  const tickerData = tickerItems.length > 0 ? tickerItems : fallbackFeed.slice(0, 10)
  const mostReadData = mostReadItems.length > 0 ? mostReadItems : fallbackFeed.slice(0, 3)

  // If absolutely nothing is available, show a clear technical issue.
  if (fallbackFeed.length === 0 && (!shapedHomepage || ((shapedHomepage.sections || []).length === 0))) {
    return (
      <div className="theme-style1">
        <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />
        <div className="bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <TechnicalIssues
              title="Technical Issues"
              message="We're experiencing technical difficulties with our content delivery. Please contact Kaburlu Media support."
            />
          </div>
        </div>
        <Footer settings={settings} tenantSlug={tenantSlug} />
      </div>
    )
  }

  // (shapedToArticle helper is defined above)

  const layout = await readHomeLayout(tenantSlug, 'style1')

  // Hero section: Use shaped homepage hero or fallback to articles
  let lead: Article | undefined
  let medium: Article[]
  let small: Article[]

  if (shapedHomepage?.hero && shapedHomepage.hero.length > 0) {
    // Use hero from shaped API
    lead = shapedToArticle(shapedHomepage.hero[0])
    
    // Use topStories for medium and small cards
    const topStories = (shapedHomepage.topStories || []).map(shapedToArticle)
    medium = topStories.slice(0, 2)
    small = topStories.slice(2, 8)
  } else {
    // Fallback to legacy data
    const latestItems = feeds.latest?.items ? feedItemsToArticles(feeds.latest.items) : []
    const latestData = latestItems.length > 0 ? latestItems : articles
    lead = latestData[0]
    medium = latestData.slice(1, 3)
    small = latestData.slice(3, 9)
  }

  // Extract sections data from shaped homepage
  const sectionDataMap: Record<string, Article[]> = {}
  if (shapedHomepage?.sections) {
    shapedHomepage.sections.forEach(section => {
      sectionDataMap[section.key] = section.items.map(shapedToArticle)
    })
  } else if (shapedHomepage?.data) {
    // Use data object if sections not available
    Object.entries(shapedHomepage.data).forEach(([key, items]) => {
      sectionDataMap[key] = items.map(shapedToArticle)
    })
  }

  const activeSections = (layout.sections || [])
    .filter((s) => s && s.isActive)
    .slice()
    .sort((a, b) => a.position - b.position)

  function activeBlocksForSection(section: HomeSection) {
    return (section.blocks || []).filter((b) => b.isActive).slice().sort((a, b) => a.position - b.position)
  }

  function renderBlock(block: HomeBlock) {
    if (!block.isActive) return null
    switch (block.type) {
      case 'heroLead':
        return lead ? <HeroLead key={block.id} tenantSlug={tenantSlugForLinks} a={lead} /> : null
      case 'mediumCards':
        return (
          <div key={block.id} className="grid grid-cols-2 gap-4">
            {medium.map((a) => (
              <CardMedium key={a.id} tenantSlug={tenantSlug} a={a} />
            ))}
          </div>
        )
      case 'smallList':
        // In the 4th column: show Most Read (3 items) from API
        // Other columns: show 3 articles from latest
        {
          const isCol4 = block.columnKey === 'col-4'
          
          if (isCol4 && mostReadData.length > 0) {
            // Column 4: Show Most Read items
            return (
              <div key={block.id} className="flex flex-col flex-1 gap-4">
                {/* Most Read Section */}
                <section className="rounded-xl bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                    <span className="inline-block h-5 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
                    Most Read
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {mostReadData.map((a) => (
                      <ListRow key={a.id} tenantSlug={tenantSlugForLinks} a={a} />
                    ))}
                  </div>
                </section>
              </div>
            )
          }
          
          return (
            <div key={block.id} className="grid grid-cols-1 gap-3">
              {small.slice(0, 3).map((a) => (
                <ListRow key={a.id} tenantSlug={tenantSlugForLinks} a={a} />
              ))}
            </div>
          )
        }
      case 'categoryBlock':
        // Smart category rendering - render dynamic category sections from API
        return <CategoryBlock key={block.id} tenantSlug={tenantSlugForLinks} columnKey={block.columnKey} />
      // Render category blocks for trending sections
      case 'trendingCategoryBlock':
        return <CategoryBlock key={block.id} tenantSlug={tenantSlugForLinks} columnKey={block.columnKey} />
      case 'trendingList':
        return <CategoryBlock key={block.id} tenantSlug={tenantSlugForLinks} columnKey={block.columnKey} />
      case 'ad': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const fmt = String(cfg.format ?? '').toLowerCase()
        if (fmt === '16:9' || fmt === '16x9') {
          return (
            <div key={block.id} className="overflow-hidden rounded-xl bg-white">
              <AdBanner variant="horizontal" />
            </div>
          )
        }
        return (
          <div key={block.id} className="overflow-hidden rounded-xl bg-white">
            <AdBanner variant="horizontal" />
          </div>
        )
      }
      case 'horizontalAd': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const label = typeof cfg.label === 'string' && cfg.label.trim() ? cfg.label.trim() : 'Horizontal Ad'
        return <HorizontalAd key={block.id} className="my-6" label={label} />
      }
      case 'categoryColumns':
        return (
          <div key={block.id} className="mt-8">
            <Section title="" noShadow bodyClassName="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <CategoryColumns tenantSlug={tenantSlugForLinks} sectionDataMap={sectionDataMap} />
            </Section>
          </div>
        )
      case 'webStoriesArea':
        return (
          <div key={block.id} className="mt-8">
            <WebStoriesArea tenantSlug={tenantSlugForLinks} />
          </div>
        )
      default:
        return null
    }
  }

  function renderMainGrid(section: HomeSection) {
    const blocks = activeBlocksForSection(section)
    const cols = section.layout?.type === 'grid' ? section.layout.columns.slice().sort((a, b) => a.position - b.position) : []
    const blocksByCol = new Map<string, HomeBlock[]>()
    for (const b of blocks) {
      const colKey = b.columnKey || ''
      if (!colKey) continue
      const list = blocksByCol.get(colKey) || []
      list.push(b)
      blocksByCol.set(colKey, list)
    }

    const colClass = (colKey: string) => {
      // All columns stretch to same height, content fills space
      if (colKey === 'col-1') return 'space-y-6 flex flex-col'
      if (colKey === 'col-2') return 'space-y-6 flex flex-col'
      if (colKey === 'col-3') return 'space-y-6 flex flex-col'
      if (colKey === 'col-4') return 'space-y-4 flex flex-col'
      return 'space-y-6 flex flex-col'
    }

    return (
      <div key={section.id} className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6 items-stretch">
        {cols.map((c) => (
          <div key={c.key} id={c.key === 'col-1' ? 'left-col' : undefined} className={colClass(c.key)}>
            {(blocksByCol.get(c.key) || []).map((b) => renderBlock(b))}
          </div>
        ))}
      </div>
    )
  }

  function renderSection(section: HomeSection): { placement: 'outside' | 'main'; node: ReactNode } | null {
    if (!section.isActive) return null

    switch (section.key) {
      case 'flashTicker':
        return {
          placement: 'outside',
          node: (
            <div key={section.id} className="bg-white">
              <div className="mx-auto max-w-7xl px-4">
                <FlashTicker tenantSlug={tenantSlugForLinks} items={tickerData.slice(0, 12)} />
              </div>
            </div>
          ),
        }
      case 'mainGrid4':
        return { placement: 'main', node: renderMainGrid(section) }
      case 'horizontalAd1':
      case 'horizontalAd2':
      case 'horizontalAd3': {
        const b = activeBlocksForSection(section).find((x) => x.type === 'horizontalAd')
        if (!b) return null
        return { placement: 'main', node: renderBlock(b) }
      }
      case 'categoryHub': {
        const b = activeBlocksForSection(section).find((x) => x.type === 'categoryColumns')
        if (!b) return null
        return { placement: 'main', node: renderBlock(b) }
      }
      case 'webStories': {
        const b = activeBlocksForSection(section).find((x) => x.type === 'webStoriesArea')
        if (!b) return null
        return { placement: 'main', node: renderBlock(b) }
      }
      default:
        return null
    }
  }

  const parts = activeSections.map((s) => renderSection(s)).filter(Boolean) as Array<{ placement: 'outside' | 'main'; node: ReactNode }>

  const rendered: ReactNode[] = []
  let mainChunk: ReactNode[] = []
  let mainKey = 0

  function flushMain() {
    if (mainChunk.length === 0) return
    rendered.push(
      <main id="main-content" key={`main-${mainKey++}`} className="mx-auto max-w-7xl px-4 py-3">
        {mainChunk}
      </main>,
    )
    mainChunk = []
  }

  for (const p of parts) {
    if (p.placement === 'outside') {
      flushMain()
      rendered.push(p.node)
    } else {
      mainChunk.push(p.node)
    }
  }
  flushMain()

  // 🎯 Get config for branding (logo, favicon, etc.)
  const config = await getConfig()
  const logoUrl = config?.branding.logo || settings?.branding?.logoUrl
  const siteName = config?.branding.siteName || title

  return (
    <div className="theme-style1">
      <Navbar tenantSlug={tenantSlugForLinks} title={siteName} logoUrl={logoUrl} />
      {rendered}
      <MobileBottomNav tenantSlug={tenantSlugForLinks} />
      <Footer settings={settings} tenantSlug={tenantSlugForLinks} />
    </div>
  )
}

// Reporter Card Component - Enhanced with Recent Articles
function ReporterCard({ reporter, tenantSlug }: { reporter: NonNullable<Article['reporter']>; tenantSlug: string }) {
  const locationParts = [
    reporter.location?.mandal,
    reporter.location?.district,
    reporter.location?.state
  ].filter(Boolean).join(', ')

  return (
    <div className="px-6 sm:px-8 lg:px-10 py-8 bg-gradient-to-br from-zinc-50 to-white border-t border-zinc-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          రచయిత గురించి
        </h3>
      </div>

      <div className="rounded-2xl border-2 border-zinc-200 bg-white shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
            {/* Reporter Photo */}
            <div className="shrink-0">
              {reporter.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={reporter.photoUrl} 
                  alt={reporter.name || 'Reporter'} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-red-100"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-red-100">
                  <span className="text-white text-3xl sm:text-4xl font-bold">
                    {reporter.name?.charAt(0).toUpperCase() || 'R'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Reporter Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xl sm:text-2xl font-bold text-zinc-900">{reporter.name}</h4>
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm sm:text-base font-semibold text-red-600 mb-2">{reporter.designation}</p>
              {locationParts && (
                <p className="text-sm text-zinc-600 flex items-center gap-1 mb-3">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {locationParts}
                </p>
              )}
              {reporter.totalArticles && reporter.totalArticles > 0 && (
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {reporter.totalArticles} ఆర్టికల్స్ రాశారు
                </div>
              )}
            </div>
          </div>

          {/* Recent Articles by Reporter */}
          {reporter.recentArticles && reporter.recentArticles.length > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-200">
              <h5 className="text-lg font-bold text-zinc-900 mb-4">ఇటీవలి ఆర్టికల్స్</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {reporter.recentArticles.slice(0, 3).map((recentArticle) => (
                  <a 
                    key={recentArticle.id} 
                    href={articleHref(tenantSlug, recentArticle.slug || recentArticle.id || '')}
                    className="group block rounded-lg overflow-hidden bg-zinc-50 hover:bg-red-50 transition-all border border-zinc-200 hover:border-red-300"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      {recentArticle.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={recentArticle.coverImageUrl} 
                          alt={recentArticle.title || ''} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <PlaceholderImg className="w-full h-full object-cover" />
                      )}
                      {recentArticle.category && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            {recentArticle.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h6 className="text-sm font-semibold text-zinc-900 group-hover:text-red-600 line-clamp-2 leading-snug" style={{ lineHeight: '1.6' }}>
                        {recentArticle.title}
                      </h6>
                      {recentArticle.viewCount && (
                        <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {recentArticle.viewCount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Publisher Card Component
function PublisherCard({ publisher }: { publisher: NonNullable<Article['publisher']> }) {
  return (
    <div className="px-6 sm:px-8 lg:px-10 py-8 bg-gradient-to-br from-zinc-50 to-white border-t border-zinc-200">
      <div className="rounded-2xl border-2 border-zinc-200 bg-white shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-4">
            {publisher.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={publisher.logoUrl} 
                alt={publisher.name || ''} 
                className="w-16 h-16 object-contain"
                loading="lazy"
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-zinc-900">{publisher.nativeName || publisher.name}</h3>
              <p className="text-sm text-zinc-600">{publisher.publisherName}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed" style={{ lineHeight: '1.8' }}>
            {publisher.nativeName} నుండి నాణ్యమైన వార్తలు మరియు సమాచారం. మీరు నమ్మదగిన వార్తా మూలం.
          </p>
        </div>
      </div>
    </div>
  )
}

// Trending Articles Sidebar Component
function TrendingArticlesSidebar({ trending, tenantSlug }: { trending: NonNullable<Article['trending']>; tenantSlug: string }) {
  if (!trending || trending.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          ట్రెండింగ్
        </h3>
      </div>
      <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
        {trending.slice(0, 5).map((trendingArticle, index) => (
          <a 
            key={trendingArticle.id} 
            href={articleHref(tenantSlug, trendingArticle.slug || trendingArticle.id || '')}
            className="group flex gap-3 p-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all"
          >
            {/* Trending Badge */}
            <div className="shrink-0">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${
                index < 3 
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md' 
                  : 'bg-zinc-100 text-zinc-600 group-hover:bg-red-100 group-hover:text-red-600'
              }`}>
                🔥
              </div>
            </div>
            
            {/* Thumbnail */}
            {trendingArticle.coverImageUrl && (
              <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={trendingArticle.coverImageUrl} 
                  alt={trendingArticle.title || ''} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Article Info */}
            <div className="flex-1 min-w-0">
              {trendingArticle.category && (
                <span className="inline-block text-xs font-bold text-red-600 mb-1">
                  {trendingArticle.category.name}
                </span>
              )}
              <h4 className="text-sm font-semibold line-clamp-2 text-zinc-900 group-hover:text-red-600 transition-colors" style={{ lineHeight: '1.6' }}>
                {trendingArticle.title}
              </h4>
              {trendingArticle.viewCount && (
                <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {trendingArticle.viewCount.toLocaleString()}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// Article Content with Must-Read Card
function ArticleContentWithMustRead({ html, mustRead, tenantSlug }: { html: string; mustRead: Article['mustRead']; tenantSlug: string }) {
  if (!html) {
    return (
      <div className="px-6 sm:px-8 lg:px-10 py-8">
        <div className="text-center py-12">
          <p className="text-zinc-500 text-lg">ఆర్టికల్ కంటెంట్ లోడ్ అవుతోంది...</p>
        </div>
      </div>
    )
  }
  
  const parts = html.split(/<\/p>/i)
  const nodes: ReactNode[] = []
  const every = getAdEveryN()
  let paraIndex = 0
  let actualParagraphCount = 0
  let mustReadInserted = false
  
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i].trim()
    if (chunk.length === 0) continue
    
    const closed = chunk.endsWith('</p>') ? chunk : chunk + '</p>'
    
    // Check if this is the first real paragraph (has substantial text content)
    const isFirstPara = actualParagraphCount === 0 && chunk.length > 50
    
    // Add drop cap styling to first paragraph
    const paragraphClass = isFirstPara 
      ? "article-paragraph first-paragraph drop-cap" 
      : "article-paragraph"
    
    nodes.push(
      <div 
        key={`p-${i}`} 
        className={paragraphClass}
        dangerouslySetInnerHTML={{ __html: closed }} 
      />
    )
    
    actualParagraphCount++
    paraIndex++
    
    // Insert must-read card after 2-3 paragraphs
    if (!mustReadInserted && mustRead && actualParagraphCount === 3) {
      nodes.push(
        <div key="must-read" className="my-8">
          <MustReadCard mustRead={mustRead} tenantSlug={tenantSlug} />
        </div>
      )
      mustReadInserted = true
    }
    
    // Insert ad after every N paragraphs, but not at the very end and not right after first paragraph
    if (paraIndex % every === 0 && i < parts.length - 2 && paraIndex > 2) {
      nodes.push(
        <div key={`ad-${i}`} className="my-8">
          <ConditionalAdBanner variant="horizontal" />
        </div>
      )
    }
  }
  
  return (
    <div className="article-content-enhanced px-6 sm:px-8 lg:px-10 py-8">
      {nodes}
    </div>
  )
}

// Must Read Card Component
function MustReadCard({ mustRead, tenantSlug }: { mustRead: NonNullable<Article['mustRead']>; tenantSlug: string }) {
  return (
    <div className="relative group">
      {/* Must Read Label */}
      <div className="absolute -top-3 left-4 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          తప్పక చదవండి
        </span>
      </div>
      
      <a 
        href={articleHref(tenantSlug, mustRead.slug || mustRead.id || '')}
        className="block overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-all hover:border-amber-300"
      >
        <div className="flex flex-col sm:flex-row gap-4 p-6">
          {/* Must Read Image */}
          {mustRead.coverImageUrl && (
            <div className="shrink-0 w-full sm:w-48 aspect-video sm:aspect-square rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={mustRead.coverImageUrl} 
                alt={mustRead.title || ''} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}
          
          {/* Must Read Content */}
          <div className="flex-1">
            {mustRead.category && (
              <span className="inline-block bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                {mustRead.category.name}
              </span>
            )}
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 group-hover:text-amber-700 leading-snug mb-2" style={{ lineHeight: '1.5' }}>
              {mustRead.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-zinc-600 mt-3">
              {mustRead.publishedAt && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(mustRead.publishedAt).toLocaleDateString('te-IN', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {mustRead.viewCount && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {mustRead.viewCount.toLocaleString()} చూసినవారు
                </span>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  )
}

export async function ThemeArticle({ tenantSlug, title, article, tenantDomain }: { tenantSlug: string; title: string; article: Article; tenantDomain?: string }) {
  const settings = await getEffectiveSettings()
  
  // Extract authors from new API structure
  const authors = article.authors && Array.isArray(article.authors) ? article.authors : []
  const primaryAuthor = authors[0] || { name: 'Staff Reporter', role: 'reporter' }
  
  // Calculate reading time from API or content
  const readingTime = article.readingTimeMin || (article.plainText ? Math.ceil(article.plainText.split(/\s+/).length / 200) : 3)

  // Format publish date
  const publishedAt = article.publishedAt || new Date().toISOString()
  const publishDate = new Date(publishedAt)
  const formattedDate = publishDate.toLocaleDateString('te-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Get breadcrumb from categories
  const category = article.categories && article.categories[0]
  const categoryName = category?.name || 'ఆర్టికల్'
  const categorySlug = category?.slug
  
  // Get reporter info from API
  const reporter = article.reporter
  const publisher = article.publisher
  
  // Get must-read article
  const mustRead = article.mustRead
  
  // Get trending articles
  const trending = article.trending || []
  
  // Get related articles
  const related = article.related || []

  return (
    <div className="theme-style1 bg-zinc-50">
      <ReadingProgress />
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />
      
      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
        {/* Enhanced Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <a href={`/${tenantSlug ? `t/${tenantSlug}` : ''}`} className="flex items-center gap-1 text-zinc-600 hover:text-red-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                హోమ్
              </a>
            </li>
            {categorySlug && (
              <>
                <li className="text-zinc-400">/</li>
                <li>
                  <a href={`/${tenantSlug ? `t/${tenantSlug}/category/${categorySlug}` : `category/${categorySlug}`}`} className="text-zinc-600 hover:text-red-600 transition-colors">
                    {categoryName}
                  </a>
                </li>
              </>
            )}
            <li className="text-zinc-400">/</li>
            <li className="text-zinc-900 font-medium truncate max-w-xs" title={article.title}>
              {article.title.substring(0, 40)}...
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Article Content */}
          <article className="min-w-0">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Article Header */}
              <header className="p-6 sm:p-8 lg:p-10">
                {/* Category Badge */}
                {category && (
                  <div className="mb-4">
                    <a 
                      href={`/${tenantSlug ? `t/${tenantSlug}/category/${categorySlug}` : `category/${categorySlug}`}`}
                      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {categoryName}
                    </a>
                  </div>
                )}

                {/* Article Title */}
                <h1 
                  className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.15] text-zinc-900"
                  style={{ fontFamily: 'Noto Serif Telugu, serif', lineHeight: '1.4' }}
                >
                  {article.title}
                </h1>
                
                {/* Article Subtitle */}
                {article.subtitle && (
                  <h2 
                    className="mb-6 text-xl sm:text-2xl font-medium text-zinc-700 leading-relaxed"
                    style={{ fontFamily: 'Noto Sans Telugu, sans-serif', lineHeight: '1.8' }}
                  >
                    {article.subtitle}
                  </h2>
                )}
                
                {/* Article Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 pb-6 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    {reporter?.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={reporter.photoUrl} 
                        alt={reporter.name || 'Reporter'} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-zinc-500">రచయిత</div>
                      <div className="font-semibold text-zinc-900">{reporter?.name || primaryAuthor.name || 'Staff Reporter'}</div>
                    </div>
                  </div>
                  
                  <div className="h-8 w-px bg-zinc-300" />
                  
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <time dateTime={publishDate.toISOString()}>{formattedDate}</time>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{readingTime} నిమిషాల పఠనం</span>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="mt-6">
                  <ShareButtons 
                    url={`https://${tenantDomain || 'kaburlutoday.com'}${articleHref(tenantSlug, article.slug || article.id)}`}
                    title={article.title}
                  />
                </div>
              </header>

              {/* Featured Image */}
              {article.coverImage?.url && (
                <figure className="mb-0">
                  <div className="relative aspect-video w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={article.coverImage.url} 
                      alt={article.coverImage.alt || article.title} 
                      className="w-full h-full object-cover" 
                      loading="eager"
                    />
                  </div>
                  {article.coverImage.caption && (
                    <figcaption className="px-6 sm:px-8 lg:px-10 py-3 text-sm text-zinc-600 italic bg-zinc-50">
                      {article.coverImage.caption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Article Highlights */}
              {article.highlights && article.highlights.length > 0 && (
                <div className="px-6 sm:px-8 lg:px-10 pt-8">
                  <div className="rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-600 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <svg className="h-6 w-6 text-blue-600 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-3">ముఖ్య విషయాలు</h3>
                        <ul className="space-y-2">
                          {article.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-base text-zinc-800 leading-relaxed" style={{ lineHeight: '1.8' }}>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Article Summary/Excerpt */}
              {article.excerpt && (
                <div className="px-6 sm:px-8 lg:px-10 pt-8">
                  <div className="rounded-xl bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-l-4 border-red-600 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <svg className="h-6 w-6 text-red-600 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-2">సారాంశం</h3>
                        <p className="text-base sm:text-lg text-zinc-800 leading-relaxed font-medium" style={{ lineHeight: '1.8' }}>
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Ad - Above Content */}
              <div className="px-6 sm:px-8 lg:px-10 pt-8">
                <div className="rounded-xl overflow-hidden shadow-sm border border-zinc-200">
                  <AdBanner variant="horizontal" />
                </div>
              </div>

              {/* Article Content with Must-Read Card */}
              <ArticleContentWithMustRead 
                html={article.contentHtml || article.content || ''} 
                mustRead={mustRead}
                tenantSlug={tenantSlug}
              />

              {/* Additional Images Gallery */}
              {article.media?.images && article.media.images.length > 0 && (
                <div className="px-6 sm:px-8 lg:px-10 pb-8">
                  <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    ఫోటో గ్యాలరీ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {article.media.images.map((img: any, idx: number) => (
                      <figure key={idx} className="group cursor-pointer">
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={img.url} 
                            alt={img.alt || img.caption || `Image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {img.caption && (
                          <figcaption className="mt-2 text-sm text-zinc-600">
                            {img.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Ad */}
              <div className="px-6 sm:px-8 lg:px-10 pb-8">
                <div className="rounded-xl overflow-hidden shadow-sm border border-zinc-200">
                  <AdBanner variant="horizontal" />
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="px-6 sm:px-8 lg:px-10 pb-8 border-b border-zinc-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <svg className="w-5 h-5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {article.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reporter Card - Enhanced with Recent Articles */}
              {reporter ? (
                <ReporterCard reporter={reporter} tenantSlug={tenantSlug} />
              ) : publisher ? (
                <PublisherCard publisher={publisher} />
              ) : null}
            </div>

            {/* Related Articles */}
            {related && related.length > 0 && (
              <div className="mt-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <span className="inline-block h-8 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-orange-500" />
                    సంబంధిత వార్తలు
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((relatedArticle) => (
                      <a 
                        key={relatedArticle.id} 
                        href={articleHref(tenantSlug, relatedArticle.slug || relatedArticle.id || '')} 
                        className="group block overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-zinc-100"
                      >
                        <div className="relative aspect-video w-full overflow-hidden">
                          {relatedArticle.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={relatedArticle.coverImageUrl} 
                              alt={relatedArticle.title || ''} 
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]" 
                              loading="lazy" 
                            />
                          ) : (
                            <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-red-600 transition-colors" style={{ lineHeight: '1.8' }}>
                            {relatedArticle.title}
                          </h3>
                          {relatedArticle.viewCount && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {relatedArticle.viewCount.toLocaleString()} చూసినవారు
                            </div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Trending Articles */}
              {trending && trending.length > 0 && (
                <TrendingArticlesSidebar trending={trending} tenantSlug={tenantSlug} />
              )}
              
              {/* Most Read */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    అత్యధికంగా చదివినవి
                  </h3>
                </div>
                <div className="p-4">
                  <MostReadSidebar tenantSlug={tenantSlug} currentArticleId={article.id} />
                </div>
              </div>
              
              {/* Sidebar Ad */}
              <div className="rounded-2xl overflow-hidden shadow-sm">
                <AdBanner variant="tall" />
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      <MobileBottomNav tenantSlug={tenantSlug} />
      <Footer settings={settings} tenantSlug={tenantSlug} />
    </div>
  )
}

function getAdEveryN() {
  const raw = Number(process.env.NEXT_PUBLIC_ARTICLE_AD_EVERY_N_PARAGRAPHS || '6')
  if (Number.isFinite(raw) && raw >= 1) return Math.max(5, Math.floor(raw))
  return 6
}

function HorizontalInlineAd() {
  return (
    <div className="my-8 not-prose">
      <div className="relative group">
        {/* Ad Label */}
        <div className="absolute -top-3 left-4 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Advertisement
          </span>
        </div>
        
        {/* Ad Container */}
        <div className="overflow-hidden rounded-2xl shadow-md bg-linear-to-br from-zinc-50 to-white border border-zinc-200">
          <AdBanner variant="horizontal" />
        </div>
      </div>
    </div>
  )
}

// Enhanced Article Content with Drop Caps and Better Typography for Telugu
function EnhancedArticleContent({ html }: { html: string }) {
  if (!html) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 text-lg">ఆర్టికల్ కంటెంట్ లోడ్ అవుతోంది...</p>
      </div>
    )
  }
  
  const parts = html.split(/<\/p>/i)
  const every = getAdEveryN()
  const nodes: ReactNode[] = []
  let paraIndex = 0
  let actualParagraphCount = 0
  
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i].trim()
    if (chunk.length === 0) continue
    
    const closed = chunk.endsWith('</p>') ? chunk : chunk + '</p>'
    
    // Check if this is the first real paragraph (has substantial text content)
    const isFirstPara = actualParagraphCount === 0 && chunk.length > 50
    
    // Add drop cap styling to first paragraph
    const paragraphClass = isFirstPara 
      ? "article-paragraph first-paragraph drop-cap" 
      : "article-paragraph"
    
    nodes.push(
      <div 
        key={`p-${i}`} 
        className={paragraphClass}
        dangerouslySetInnerHTML={{ __html: closed }} 
      />
    )
    
    actualParagraphCount++
    paraIndex++
    
    // Insert ad after every N paragraphs, but not at the very end and not right after first paragraph
    if (paraIndex % every === 0 && i < parts.length - 2 && paraIndex > 2) {
      nodes.push(
        <div key={`ad-${i}`} className="my-8">
          <ConditionalAdBanner variant="horizontal" />
        </div>
      )
    }
  }
  
  return <>{nodes}</>
}

// Conditional Ad Banner - only shows if ad content exists
function ConditionalAdBanner({ variant }: { variant: 'horizontal' | 'tall' }) {
  // This component will be rendered but AdSlot handles showing/hiding based on content
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50">
      <AdBanner variant={variant} />
    </div>
  )
}

function InterleavedArticle({ html }: { html: string }) {
  if (!html) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 text-lg">Article content is loading...</p>
      </div>
    )
  }
  
  const parts = html.split(/<\/p>/i)
  const every = getAdEveryN()
  const nodes: ReactNode[] = []
  let paraIndex = 0
  
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i]
    if (chunk.trim().length === 0) continue
    
    const closed = chunk.endsWith('</p>') ? chunk : chunk + '</p>'
    nodes.push(
      <div 
        key={`p-${i}`} 
        className="article-paragraph" 
        dangerouslySetInnerHTML={{ __html: closed }} 
      />
    )
    paraIndex++
    
    // Insert ad after every N paragraphs, but not at the very end
    if (paraIndex % every === 0 && i < parts.length - 2) {
      nodes.push(<HorizontalInlineAd key={`ad-${i}`} />)
    }
  }
  
  return <>{nodes}</>
}

// Unused component - keeping for future use
// async function LatestArticles({ tenantSlug }: { tenantSlug: string }) {
//   const items = await getHomeFeed('na')
//   return (
//     <>
//       {items.slice(0, 8).map((a) => (
//         <a key={a.id} href={articleHref(tenantSlug, a.slug || a.id)} className="block px-4 py-3 text-sm font-medium leading-snug hover:text-red-600 hover:bg-zinc-50 transition-colors line-clamp-2">
//           {a.title}
//         </a>
//       ))}
//     </>
//   )
// }

async function MustReadSection({ tenantSlug, currentArticleId }: { tenantSlug: string; currentArticleId: string }) {
  let items: Article[] = []
  try {
    // Fetch trending/must-read articles
    items = await getHomeFeed('na')
    // Filter out current article
    items = items.filter((a) => a.id !== currentArticleId).slice(0, 6)
  } catch {
    items = []
  }

  if (items.length === 0) return null

  return (
    <section id="must-read" className="mb-12 scroll-mt-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
          <span className="inline-block h-8 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
          Must Read
        </h2>
        <p className="mt-2 text-zinc-600">Don&apos;t miss these trending stories</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <a 
            key={a.id} 
            href={articleHref(tenantSlug, a.slug || a.id)} 
            className="group block overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              {a.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={a.coverImage.url} 
                  alt={a.title} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  loading="lazy"
                />
              ) : (
                <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg">
                  Must Read
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                {a.title}
              </h3>
              {a.excerpt && (
                <p className="mt-2 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                  {a.excerpt}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

function ReporterSection({ reporter }: { reporter: { name: string; photo: string; designation: string; bio: string } }) {
  return (
    <section id="author" className="mb-12 scroll-mt-24">
      <div className="rounded-2xl bg-linear-to-br from-zinc-50 to-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-red-600 to-red-500 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            About the Author
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Reporter Photo */}
            <div className="shrink-0">
              {reporter.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={reporter.photo} 
                  alt={reporter.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-red-600 to-red-500 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-3xl sm:text-4xl font-bold">
                    {reporter.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Reporter Info */}
            <div className="grow">
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1">
                {reporter.name}
              </h3>
              <p className="text-sm sm:text-base font-medium text-red-600 mb-3">
                {reporter.designation}
              </p>
              {reporter.bio && (
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed mb-4">
                  {reporter.bio}
                </p>
              )}
              
              {/* Social Links (placeholder - can be made dynamic) */}
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-zinc-700 text-white hover:bg-zinc-800 transition-colors"
                  aria-label="Email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

async function RelatedArticles({ tenantSlug, article }: { tenantSlug: string; article: Article }) {
  let items: Article[] = []
  try {
    let firstCat: string | undefined
    const categories = article['categories']
    if (Array.isArray(categories) && categories.length > 0) {
      const first = categories[0]
      if (first && typeof first === 'object') {
        const o = first as Record<string, unknown>
        const categoryObj = o['category']
        const directSlug = o['slug']
        if (categoryObj && typeof categoryObj === 'object') {
          const co = categoryObj as Record<string, unknown>
          if (typeof co['slug'] === 'string') firstCat = co['slug']
        }
        if (!firstCat && typeof directSlug === 'string') firstCat = directSlug
      }
    }
    if (firstCat) {
      items = await getArticlesByCategory('na', firstCat)
    } else {
      // Fallback: use first nav category
      const cats = await getCategoriesForNav()
      const cat = cats[0]
      if (cat) items = await getArticlesByCategory('na', cat.slug)
    }
  } catch {
    items = []
  }
  const show = items.filter((a) => (a.slug || a.id) !== (article.slug || article.id)).slice(0, 6)
  return (
    <>
      {show.map((a) => (
        <a key={a.id} href={articleHref(tenantSlug, a.slug || a.id)} className="group block overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="relative aspect-video w-full overflow-hidden">
            {a.coverImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]" loading="lazy" />
            ) : (
              <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
          <div className="p-4">
            <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
              {a.title}
            </h3>
          </div>
        </a>
      ))}
    </>
  )
}

// Most Read Sidebar Component - Sticky with scroll
async function MostReadSidebar({ tenantSlug, currentArticleId }: { tenantSlug: string; currentArticleId: string }) {
  let items: Article[] = []
  try {
    items = await getHomeFeed('na')
    items = items.filter((a) => a.id !== currentArticleId).slice(0, 10)
  } catch {
    items = []
  }

  if (items.length === 0) return null

  return (
    <div className="rounded-xl bg-white shadow-lg overflow-hidden border border-zinc-100">
      <div className="bg-linear-to-r from-red-600 via-red-500 to-pink-600 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Most Read</h3>
            <p className="text-xs text-white/90">Trending Now</p>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-zinc-100 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        {items.map((a, index) => (
          <a 
            key={a.id} 
            href={articleHref(tenantSlug, a.slug || a.id)} 
            className="group flex gap-3 p-4 hover:bg-linear-to-r hover:from-red-50 hover:to-transparent transition-all"
          >
            {/* Rank Number */}
            <div className="shrink-0">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${
                index < 3 
                  ? 'bg-linear-to-br from-red-600 to-red-500 text-white shadow-md' 
                  : 'bg-zinc-100 text-zinc-600 group-hover:bg-red-100 group-hover:text-red-600'
              }`}>
                {index + 1}
              </div>
            </div>
            
            {/* Article Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold line-clamp-3 text-zinc-900 group-hover:text-red-600 transition-colors mb-2" style={{ lineHeight: '2.0' }}>
                {a.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {(() => {
                    const publishDate = a.publishDate || a.createdAt
                    if (!publishDate) return 'Recently'
                    try {
                      const date = new Date(String(publishDate))
                      if (isNaN(date.getTime())) return 'Recently'
                      const now = new Date()
                      const diffMs = now.getTime() - date.getTime()
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                      if (diffHours < 1) return 'Just now'
                      if (diffHours < 24) return `${diffHours}h ago`
                      const diffDays = Math.floor(diffHours / 24)
                      if (diffDays < 7) return `${diffDays}d ago`
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    } catch {
                      return 'Recently'
                    }
                  })()}
                </span>
              </div>
            </div>
            
            {/* Thumbnail */}
            <div className="shrink-0">
              <div className="h-16 w-20 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                {a.coverImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={a.coverImage.url} 
                    alt={a.title} 
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    loading="lazy"
                  />
                ) : (
                  <PlaceholderImg className="h-full w-full object-cover" />
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
      
      {/* View All Footer */}
      <div className="border-t border-zinc-100 bg-zinc-50 p-3">
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          <span>View All Articles</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

async function CategoryColumns({ 
  tenantSlug, 
  sectionDataMap = {} 
}: { 
  tenantSlug: string
  sectionDataMap?: Record<string, Article[]>
}) {
  const cats: Category[] = await getCategoriesForNav()

  // Use real backend categories. Some tenants don't have slugs like `latest` or `breaking`.
  // Prefer common news slugs, then fill from available categories.
  const preferredSlugs = ['national', 'entertainment', 'politics', 'sports', 'technology', 'business', 'international']
  const preferred = preferredSlugs
    .map((slug) => cats.find((c) => c.slug === slug))
    .filter(Boolean) as Category[]

  const chosen: Category[] = []
  const seen = new Set<string>()
  for (const c of preferred) {
    if (!c || seen.has(c.slug)) continue
    chosen.push(c)
    seen.add(c.slug)
    if (chosen.length >= 4) break
  }
  for (const c of cats) {
    if (!c || seen.has(c.slug)) continue
    chosen.push(c)
    seen.add(c.slug)
    if (chosen.length >= 4) break
  }

  const fillToCount = (primary: Article[], feed: Article[], target: number) => {
    const out = primary.slice(0, target)
    const seen = new Set(out.map((a) => a.id))
    for (const a of feed) {
      if (!a || seen.has(a.id)) continue
      out.push(a)
      seen.add(a.id)
      if (out.length >= target) break
    }
    return out
  }

  const feed = await getHomeFeed('na')
  
  // Build lists: prefer sectionDataMap, fallback to category fetch
  const lists = await Promise.all(
    chosen.map(async (c) => {
      // Try to get from sectionDataMap first (check both slugs for politics)
      const slugsToCheck = c.slug === 'politics' || c.slug === 'political' 
        ? ['political', 'politics'] 
        : [c.slug]
      
      let items: Article[] = []
      for (const slug of slugsToCheck) {
        items = sectionDataMap[slug] || []
        if (items.length > 0) {
          console.log(`✅ Using pre-fetched data for ${c.name} (${slug}): ${items.length} items`)
          break
        }
      }
      
      // If not enough items, fetch from category API
      if (items.length < 5) {
        console.log(`⚠️ Fetching more for ${c.name}...`)
        const categoryArticles = await getArticlesByCategory('na', c.slug)
        items = fillToCount(items.length > 0 ? items : categoryArticles, feed, 5)
      }
      
      return {
        category: c,
        items: items.slice(0, 5), // Ensure max 5 items
      }
    })
  )
  return (
    <>
      {lists.map(({ category: c, items }) => (
        <section key={c.id} className="rounded-xl bg-white">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <Link href={toHref(categoryHref(tenantSlug, c.slug))} className="inline-flex items-center gap-2">
              <span className="inline-block h-5 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
              <span className="text-sm font-bold uppercase tracking-wide hover:text-red-600">{c.name}</span>
            </Link>
            <Link
              href={toHref(categoryHref(tenantSlug, c.slug))}
              className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50"
            >
              View More →
            </Link>
          </div>
          <div className="space-y-3 p-3">
            {/* Featured item at top with 16:9 image and 2-line title */}
            {items[0] && (
              <div className="space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded">
                  {items[0].coverImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={items[0].coverImage.url} alt={items[0].title} className="h-full w-full object-cover" />
                  ) : (
                    <PlaceholderImg className="h-full w-full object-cover" />
                  )}
                </div>
                <Link href={toHref(articleHref(tenantSlug, items[0].slug || items[0].id))} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-red-600">
                  {items[0].title}
                </Link>
              </div>
            )}
            {/* Remaining items in compact rows with thumbs */}
            {items.slice(1).map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-3 border-b border-dashed border-zinc-200 last:border-b-0"
              >
                <Link
                  href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                  className="line-clamp-2 text-sm font-semibold leading-tight hover:text-red-600"
                >
                  {a.title}
                </Link>
                <div className="h-16 w-24 overflow-hidden rounded">
                  {a.coverImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
                  ) : (
                    <PlaceholderImg className="h-full w-full object-cover" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

// TrendingCategoryBlock component removed as per user request
/* async function TrendingCategoryBlock({ tenantSlug }: { tenantSlug: string }) {
  const cats: Category[] = await getCategoriesForNav()
  const preferred = (process.env.NEXT_PUBLIC_TRENDING_CATEGORY || '').trim().toLowerCase()
  const category = preferred
    ? cats.find((c) => c.slug.toLowerCase() === preferred || c.name.toLowerCase() === preferred) || cats[0]
    : cats[0]
  const items = category ? (await getArticlesByCategory('na', category.slug)).slice(0, 6) : []
  const title = category ? category.name : 'Trending News'
  const href = category ? categoryHref(tenantSlug, category.slug) : undefined

  return (
    <section className="mb-8 rounded-xl bg-white">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="inline-flex items-center gap-2">
          <span className="inline-block h-5 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
          {href ? (
            <a href={href} className="text-sm font-bold uppercase tracking-wide hover:text-red-600">
              {title}
            </a>
          ) : (
            <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
          )}
        </div>
        {href ? (
          <a href={href} className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50">
            View More →
          </a>
        ) : null}
      </div>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="grid grid-cols-[160px_1fr] items-center gap-3">
            <div className="relative h-24 w-40 overflow-hidden rounded">
              {a.coverImage?.url ? (
                <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
              ) : (
                <PlaceholderImg className="h-full w-full object-cover" />
              )}
            </div>
            <a href={articleHref(tenantSlug, a.slug || a.id)} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-red-600">
              {a.title}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
} */

async function WebStoriesArea({ tenantSlug }: { tenantSlug: string }) {
  const cats: Category[] = await getCategoriesForNav()
  const preferred = (process.env.NEXT_PUBLIC_WEBSTORIES_CATEGORY || '').trim().toLowerCase()
  const category = preferred
    ? cats.find((c) => c.slug.toLowerCase() === preferred || c.name.toLowerCase() === preferred) || cats[0]
    : cats[0]
  const items = category ? (await getArticlesByCategory('na', category.slug)).slice(0, 8) : []
  const moreHref = category ? categoryHref(tenantSlug, category.slug) : undefined

  const storyItems = items
    .filter((a) => a.coverImage?.url)
    .map((a) => ({
      url: articleHref(tenantSlug, a.slug || a.id),
      title: a.title,
      poster: a.coverImage?.url || '',
    }))

  const showWebStories = process.env.NEXT_PUBLIC_WEBSTORIES_ENABLED === 'true' && storyItems.length > 0

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left column: Web Stories then HG block */}
      <div className="space-y-6">
        {showWebStories && (
          <Section title="Web Stories" noShadow viewMoreHref={moreHref}
          >
            <WebStoriesGrid items={storyItems} />
            {/* Inline player demo for instant playback */}
            <div className="mt-6">
              <WebStoriesPlayer height={560} />
            </div>
          </Section>
        )}

        {/* HG block below stories */}
        <HGBlock tenantSlug={tenantSlug} />
      </div>

      {/* Right: Sticky vertical ads shared for both blocks */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <AdBanner variant="tall" />
          <AdBanner variant="default" />
        </div>
      </aside>
    </div>
  )
}

async function HGBlock({ tenantSlug }: { tenantSlug: string }) {
  const cats: Category[] = await getCategoriesForNav()
  const chosen = cats.slice(0, 2)

  const fillToCount = (primary: Article[], feed: Article[], target: number) => {
    const out = primary.slice(0, target)
    const seen = new Set(out.map((a) => a.id))
    for (const a of feed) {
      if (!a || seen.has(a.id)) continue
      out.push(a)
      seen.add(a.id)
      if (out.length >= target) break
    }
    return out
  }

  const feed = await getHomeFeed('na')
  const lists = await Promise.all(
    chosen.map(async (c) => ({
      category: c,
      items: fillToCount(await getArticlesByCategory('na', c.slug), feed, 5),
    }))
  )

  return (
    <Section title="" noShadow>
      {lists.map(({ category: c, items }, idx) => (
        <div key={c.id} className={idx > 0 ? 'mt-6' : ''}>
          <div className="flex items-center justify-between px-3 py-2">
            <a href={categoryHref(tenantSlug, c.slug)} className="inline-flex items-center gap-2 text-base font-bold">
              <span className="inline-block h-5 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
              <span className="hover:text-red-600">{c.name}</span>
            </a>
            <a
              href={categoryHref(tenantSlug, c.slug)}
              className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium hover:bg-zinc-50"
            >
              View More →
            </a>
          </div>

          {(() => {
            const featured = items[0]
            const rest = items.slice(1, 5)
            if (!featured) {
              return (
                <div className="grid grid-cols-2 gap-4 p-3 md:grid-cols-4">
                  {rest.map((a) => (
                    <a key={a.id} href={articleHref(tenantSlug, a.slug || a.id)} className="group block">
                      <div className="relative aspect-video w-full overflow-hidden rounded-md">
                        {a.coverImage?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                        ) : (
                          <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="mt-2 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-red-600">{a.title}</div>
                    </a>
                  ))}
                </div>
              )
            }
            return (
              <div className="grid gap-4 p-3 md:grid-cols-5">
                {/* Featured big card */}
                <a href={articleHref(tenantSlug, featured.slug || featured.id)} className="group relative md:col-span-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                    {featured.coverImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featured.coverImage.url} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-lg font-extrabold leading-snug line-clamp-2 drop-shadow-md">{featured.title}</h3>
                    </div>
                  </div>
                </a>

                {/* Four small cards */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {rest.map((a) => (
                    <a key={a.id} href={articleHref(tenantSlug, a.slug || a.id)} className="group block">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                        {a.coverImage?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                        ) : (
                          <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="mt-2 text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-red-600">{a.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      ))}
    </Section>
  )
}

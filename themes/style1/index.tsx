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
  // If no articles provided, show technical issues
  if (!articles || articles.length === 0) {
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

  // Determine the API version based on theme setting
  const themeKey = settings?.theme?.theme || settings?.theme?.key || 'style1'
  const lang = settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'te'

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
  const tickerData = tickerItems.length > 0 ? tickerItems : articles.slice(0, 10)
  const mostReadData = mostReadItems.length > 0 ? mostReadItems : articles.slice(0, 3)

  // Helper to convert shaped articles to Article format
  const shapedToArticle = (item: HomepageShapedArticle): Article => ({
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    excerpt: item.excerpt,
    coverImage: item.coverImageUrl ? { url: item.coverImageUrl } : undefined,
    imageUrl: item.coverImageUrl,
    publishedAt: item.publishedAt,
    category: item.category,
  } as Article)

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
  const logoUrl = config?.branding.logoUrl || settings?.branding?.logoUrl
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

export async function ThemeArticle({ tenantSlug, title, article }: { tenantSlug: string; title: string; article: Article }) {
  const settings = await getEffectiveSettings()
  
  // Extract reporter/author data from article
  const reporter = article['reporter'] || article['author']
  const reporterData = reporter && typeof reporter === 'object' 
    ? {
        name: String((reporter as Record<string, unknown>)['name'] || (reporter as Record<string, unknown>)['fullName'] || 'Staff Reporter'),
        photo: String((reporter as Record<string, unknown>)['photo'] || (reporter as Record<string, unknown>)['avatar'] || ''),
        designation: String((reporter as Record<string, unknown>)['designation'] || (reporter as Record<string, unknown>)['role'] || 'Reporter'),
        bio: String((reporter as Record<string, unknown>)['bio'] || (reporter as Record<string, unknown>)['description'] || ''),
      }
    : null

  // Calculate reading time (average 200 words per minute)
  const wordCount = article.content ? article.content.split(/\s+/).length : 0
  const readingTime = Math.ceil(wordCount / 200)

  // Format publish date
  const publishedAt = article['publishedAt'] || article['createdAt']
  const publishDate = publishedAt ? new Date(String(publishedAt)) : new Date()
  const formattedDate = publishDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="theme-style1">
      <ReadingProgress />
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: `/${tenantSlug ? `t/${tenantSlug}` : ''}` },
            { label: 'Article' }
          ]}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Article Content */}
          <article className="min-w-0">
            {/* Article Header */}
            <header className="mb-8">
              <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-zinc-900">
                {article.title}
              </h1>
              
              {/* Article Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 border-b border-zinc-200 pb-4">
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
                  <span>{readingTime} min read</span>
                </div>
                {reporterData && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>By <strong className="font-semibold text-zinc-900">{reporterData.name}</strong></span>
                  </div>
                )}
              </div>

              {/* Social Share Buttons */}
              <div className="mt-4">
                <ShareButtons 
                  url={articleHref(tenantSlug, article.slug || article.id)}
                  title={article.title}
                />
              </div>
            </header>

            {/* Featured Image */}
            {article.coverImage?.url && (
              <figure className="mb-8">
                <div className="overflow-hidden rounded-2xl shadow-xl">
                  <div className="relative aspect-video w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={article.coverImage.url} 
                      alt={article.title} 
                      className="absolute inset-0 h-full w-full object-cover" 
                      loading="eager"
                    />
                  </div>
                </div>
                {(() => {
                  const caption = article['coverImageCaption']
                  if (typeof caption === 'string' && caption.trim()) {
                    return (
                      <figcaption className="mt-3 text-sm text-zinc-600 text-center italic">
                        {caption}
                      </figcaption>
                    )
                  }
                  return null
                })()}
              </figure>
            )}

            {/* Article Excerpt/Summary */}
            {article.excerpt ? (
              <div className="mb-8 rounded-2xl bg-linear-to-r from-red-50 via-orange-50 to-yellow-50 border-l-4 border-red-600 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-red-600 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-2">Article Summary</h3>
                    <p className="text-lg text-zinc-800 leading-relaxed font-medium">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Top Horizontal Ad - Above Article */}
            <div className="mb-8">
              <div className="rounded-xl overflow-hidden shadow-md">
                <AdBanner variant="horizontal" />
              </div>
            </div>

            {/* Article Content with inline ads */}
            <div className="article-content mb-8">
              <InterleavedArticle html={article.content ?? ''} />
            </div>

            {/* Bottom Horizontal Ad - After Article */}
            <div className="mb-8">
              <div className="rounded-xl overflow-hidden shadow-md">
                <AdBanner variant="horizontal" />
              </div>
            </div>

            {/* Tags */}
            {(() => {
              const tags = article['tags']
              if (!tags || !Array.isArray(tags) || tags.length === 0) return null
              return (
                <div className="mb-8 pb-8 border-b border-zinc-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {tags.map((tag, idx) => {
                      const tagStr = typeof tag === 'string' ? tag : String((tag as Record<string, unknown>)?.['name'] || '')
                      return tagStr ? (
                        <span 
                          key={idx} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                        >
                          {tagStr}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Must Read Section */}
            <MustReadSection tenantSlug={tenantSlug} currentArticleId={article.id} />

            {/* Reporter/Author Section */}
            {reporterData && (
              <ReporterSection reporter={reporterData} />
            )}

            {/* Related articles */}
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
                  <span className="inline-block h-8 w-1.5 rounded-full bg-linear-to-b from-red-600 to-red-500" />
                  Related Articles
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <RelatedArticles tenantSlug={tenantSlug} article={article} />
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Most Read Articles - Sticky Section */}
              <MostReadSidebar tenantSlug={tenantSlug} currentArticleId={article.id} />
              
              {/* Ad Banner - Top */}
              <div className="rounded-xl overflow-hidden shadow-lg">
                <AdBanner variant="default" />
              </div>

              {/* Sticky Ad Unit - Scrolls with user */}
              <div className="rounded-xl overflow-hidden shadow-lg sticky-ad-unit">
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
  
  // Define specific categories for each column
  // Col 1: latest, Col 2: entertainment, Col 3: politics, Col 4: breaking
  const categoryMap = {
    latest: cats.find(c => c.slug === 'latest') || cats[0],
    entertainment: cats.find(c => c.slug === 'entertainment') || cats[1],
    politics: cats.find(c => c.slug === 'political' || c.slug === 'politics') || cats[2],
    breaking: cats.find(c => c.slug === 'breaking') || cats[3]
  }

  const chosen = [
    categoryMap.latest,
    categoryMap.entertainment,
    categoryMap.politics,
    categoryMap.breaking
  ].filter(Boolean) // Remove nulls

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

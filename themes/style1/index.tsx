import { Footer } from '@/components/shared/Footer'
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
import { WebStoriesPlayer } from '@/components/shared/WebStoriesPlayer'
import { WebStoriesGrid } from '@/components/shared/WebStoriesGrid'
import MobileBottomNav from '@/components/shared/MobileBottomNav'
import { readHomeLayout, type HomeSection, type HomeBlock } from '@/lib/home-layout'
import { getPublicHomepage, type PublicHomepageResponse, type PublicHomepageSection } from '@/lib/homepage'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

function HorizontalAd({ className, label = 'Horizontal Ad' }: { className?: string; label?: string }) {
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl bg-white">
        <div className="w-full h-24 md:h-28 lg:h-40 border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
          {label} 728×90 / 970×250
        </div>
      </div>
    </div>
  )
}

function HeroLead({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <div className="space-y-3">
      <article className="overflow-hidden rounded-xl">
        <div className="relative aspect-[16/9] w-full">
          {a.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
      </article>
      <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="block text-2xl font-extrabold leading-tight line-clamp-2">
        {a.title}
      </Link>
    </div>
  )
}

function CardMedium({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white">
      <div className="relative aspect-[16/9] w-full">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
      <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="block p-3 text-base font-bold leading-snug hover:text-red-600 line-clamp-2">
        {a.title}
      </Link>
    </article>
  )
}

function Section({ title, children, noShadow, flushBody, viewMoreHref, bodyClassName }: { title: string; children: React.ReactNode; noShadow?: boolean; flushBody?: boolean; viewMoreHref?: string; bodyClassName?: string }) {
  const hasTitle = (title ?? '').trim().length > 0
  const bodyClasses = bodyClassName ?? (flushBody ? '' : 'p-4 space-y-4')
  return (
    <section className={`mb-8 rounded-xl bg-white ${noShadow ? '' : 'shadow-sm'}`}>
      {hasTitle && (
        <div className="flex items-center justify-between px-4 py-2">
          <div className="inline-flex items-center gap-2">
            <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
            <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
          </div>
          {viewMoreHref ? (
            <a
              href={viewMoreHref}
              className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50"
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

async function CategoryBlock({ tenantSlug }: { tenantSlug: string }) {
  const cats: Category[] = await getCategoriesForNav()
  // Allow overriding via env: NEXT_PUBLIC_LAST_NEWS_CATEGORY
  const preferred = (process.env.NEXT_PUBLIC_LAST_NEWS_CATEGORY || '').trim().toLowerCase()
  const category = preferred
    ? cats.find((c) => c.slug.toLowerCase() === preferred || c.name.toLowerCase() === preferred) || cats[0]
    : cats[0]
  const rawCount = Number(process.env.NEXT_PUBLIC_LAST_NEWS_COUNT || '8')
  const count = Number.isFinite(rawCount) && rawCount > 0 ? Math.min(8, Math.max(5, Math.floor(rawCount))) : 8
  const items = category ? (await getArticlesByCategory('na', category.slug)).slice(0, count) : []

  const title = category ? category.name : 'Last News'
  const href = category ? categoryHref(tenantSlug, category.slug) : undefined

  return (
    <section className="mb-8 rounded-xl bg-white">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="inline-flex items-center gap-2">
          <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
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
        {/* Compact rows with thumbs (no featured image here) */}
        {items.slice(0, 7).map((a) => (
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
            <div className="h-[4.25rem] w-[6.25rem] overflow-hidden rounded">
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
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md bg-white p-3">
      <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="line-clamp-2 text-sm font-semibold leading-tight hover:text-red-600">
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
}) {
  let homepage: PublicHomepageResponse | null = null
  try {
    const lang = settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'en'
    homepage = await getPublicHomepage({ v: 1, themeKey: 'style1', lang })
  } catch {
    homepage = null
  }

  // Best-practice: for root-domain home, use the tenant slug returned by backend homepage config
  // so links go to the correct tenant path.
  const tenantSlugForLinks = homepage?.tenant?.slug || tenantSlug

  const homepageSections = homepage?.sections || []
  const homepageData = homepage?.data || {}

  function sectionByType(type: string): PublicHomepageSection | undefined {
    return homepageSections.find((s) => s && s.type === type)
  }

  function itemsForSectionType(type: string): Article[] {
    const sec = sectionByType(type)
    if (!sec) return []
    const items = (homepageData as Record<string, unknown>)[sec.id]
    if (!Array.isArray(items)) return []
    // Normalize common backend shapes into our `Article` shape.
    return (items as unknown[]).map((u) => {
      const o = (u ?? {}) as Record<string, unknown>
      const id = String(o.id ?? o._id ?? o.slug ?? Math.random().toString(36).slice(2))
      const slug = typeof o.slug === 'string' ? o.slug : undefined
      const title = String(o.title ?? o.headline ?? 'Untitled')
      const excerpt = typeof o.excerpt === 'string' ? o.excerpt : (typeof o.summary === 'string' ? o.summary : undefined)
      const content = typeof o.content === 'string' ? o.content : undefined
      let coverUrl: string | undefined
      if (typeof o.coverImage === 'string') coverUrl = o.coverImage
      if (o.coverImage && typeof o.coverImage === 'object') {
        const ci = o.coverImage as Record<string, unknown>
        if (typeof ci.url === 'string') coverUrl = ci.url
      }
      const coverImageUrl = o['coverImageUrl']
      const imageUrl = o['imageUrl']
      const featuredImage = o['featuredImage']
      if (!coverUrl && typeof coverImageUrl === 'string') coverUrl = coverImageUrl
      if (!coverUrl && typeof imageUrl === 'string') coverUrl = imageUrl
      if (!coverUrl && typeof featuredImage === 'string') coverUrl = featuredImage
      return { id, slug, title, excerpt: excerpt ?? null, content: content ?? null, coverImage: coverUrl ? { url: coverUrl } : undefined } as Article
    })
  }

  const navCats = await getCategoriesForNav()

  async function resolveSectionItems(type: string): Promise<{ items: Article[]; categorySlugUsed?: string }> {
    const sec = sectionByType(type)
    if (!sec) return { items: [] }
    const direct = itemsForSectionType(type)
    if (direct.length > 0) return { items: direct }

    // Best-effort fallback: if API returns empty `data`, use its query to fetch.
    const q = (sec.query || {}) as Record<string, unknown>
    const kind = String(q.kind ?? '')
    const limit = Number(q.limit ?? 0)
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(50, Math.max(1, Math.floor(limit))) : undefined

    try {
      const categorySlug = typeof q.categorySlug === 'string' ? q.categorySlug.trim() : ''
      if (kind === 'category' && categorySlug) {
        const wanted = categorySlug
        const list = await getArticlesByCategory('na', wanted)
        const sliced = safeLimit ? list.slice(0, safeLimit) : list
        if (sliced.length > 0) return { items: sliced, categorySlugUsed: wanted }

        // If homepage config points to a category slug with no articles for this tenant,
        // fall back to a reasonable nav category so UI doesn't duplicate the same first category.
        const fallbackIndex = type === 'listWithThumb' ? 0 : type === 'twoColRows' ? 1 : 0
        const fallbackSlug = navCats[fallbackIndex]?.slug || navCats[0]?.slug
        if (fallbackSlug && fallbackSlug !== wanted) {
          const alt = await getArticlesByCategory('na', fallbackSlug)
          const altSliced = safeLimit ? alt.slice(0, safeLimit) : alt
          if (altSliced.length > 0) return { items: altSliced, categorySlugUsed: fallbackSlug }
        }
        return { items: [] }
      }
      if (kind === 'latest') {
        const list = await getHomeFeed('na')
        const sliced = safeLimit ? list.slice(0, safeLimit) : list
        return { items: sliced }
      }
    } catch {
      // ignore
    }
    return { items: [] }
  }

  const tickerRes = await resolveSectionItems('ticker')
  const heroStackRes = await resolveSectionItems('heroStack')
  const lastNewsSection = sectionByType('listWithThumb')
  const lastNewsRes = await resolveSectionItems('listWithThumb')
  const trendingCategorySection = sectionByType('twoColRows')
  const trendingCategoryRes = await resolveSectionItems('twoColRows')
  const titlesOnlyRes = await resolveSectionItems('titlesOnly')

  const tickerItems = tickerRes.items
  const heroStackItems = heroStackRes.items
  const lastNewsItems = lastNewsRes.items
  const trendingCategoryItems = trendingCategoryRes.items
  const titlesOnlyItems = titlesOnlyRes.items

  const layout = await readHomeLayout(tenantSlug, 'style1')

  const heroSource = heroStackItems.length > 0 ? heroStackItems : articles
  const lead = heroSource[0]
  const medium = heroSource.slice(1, 3)
  const small = heroSource.slice(3, 9)

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
        return (
          <div key={block.id} className="grid grid-cols-1 gap-3">
            {small.slice(0, 3).map((a) => (
              <ListRow key={a.id} tenantSlug={tenantSlugForLinks} a={a} />
            ))}
          </div>
        )
      case 'categoryBlock':
        if (lastNewsItems.length > 0) {
          const q = (lastNewsSection?.query || {}) as Record<string, unknown>
          const configured = typeof q.categorySlug === 'string' ? q.categorySlug : ''
          const slug = String(lastNewsRes.categorySlugUsed || configured || '')
          const href = slug ? categoryHref(tenantSlugForLinks, slug) : undefined
          const label = String(lastNewsSection?.label || 'Last News')
          return (
            <section key={block.id} className="mb-8 rounded-xl bg-white">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
                  {href ? (
                    <a href={href} className="text-sm font-bold uppercase tracking-wide hover:text-red-600">
                      {label}
                    </a>
                  ) : (
                    <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
                  )}
                </div>
                {href ? (
                  <a href={href} className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50">
                    View More →
                  </a>
                ) : null}
              </div>
              <div>
                {lastNewsItems.slice(0, 7).map((a) => (
                  <div
                    key={a.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-[0.725rem] px-[0.725rem] py-[0.725rem] border-b border-dashed border-zinc-200 last:border-b-0"
                  >
                    <a href={articleHref(tenantSlugForLinks, a.slug || a.id)} className="line-clamp-2 text-sm font-semibold leading-tight hover:text-red-600">
                      {a.title}
                    </a>
                    <div className="h-[4.25rem] w-[6.25rem] overflow-hidden rounded">
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
        return <CategoryBlock key={block.id} tenantSlug={tenantSlugForLinks} />
      case 'trendingCategoryBlock':
        if (trendingCategoryItems.length > 0) {
          const q = (trendingCategorySection?.query || {}) as Record<string, unknown>
          const configured = typeof q.categorySlug === 'string' ? q.categorySlug : ''
          const slug = String(trendingCategoryRes.categorySlugUsed || configured || '')
          const href = slug ? categoryHref(tenantSlugForLinks, slug) : undefined
          const label = String(trendingCategorySection?.label || 'Trending News')
          const items = trendingCategoryItems.slice(0, 6)
          return (
            <section key={block.id} className="mb-8 rounded-xl bg-white">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
                  {href ? (
                    <a href={href} className="text-sm font-bold uppercase tracking-wide hover:text-red-600">
                      {label}
                    </a>
                  ) : (
                    <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
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
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
                      ) : (
                        <PlaceholderImg className="h-full w-full object-cover" />
                      )}
                    </div>
                    <a href={articleHref(tenantSlugForLinks, a.slug || a.id)} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-red-600">
                      {a.title}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )
        }
        return <TrendingCategoryBlock key={block.id} tenantSlug={tenantSlugForLinks} />
      case 'trendingList':
        return (
          <Section key={block.id} title={String(sectionByType('titlesOnly')?.label || 'Trending News')} noShadow>
            <div>
              {(titlesOnlyItems.length > 0 ? titlesOnlyItems : articles).slice(0, 8).map((a) => (
                <a
                  key={a.id}
                  href={articleHref(tenantSlugForLinks, a.slug || a.id)}
                  className="block px-3 py-2 border-b border-zinc-100 last:border-b-0 text-sm font-medium leading-snug hover:text-red-600 line-clamp-2"
                >
                  {a.title}
                </a>
              ))}
            </div>
          </Section>
        )
      case 'ad': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const fmt = String(cfg.format ?? '').toLowerCase()
        if (fmt === '16:9' || fmt === '16x9') {
          return (
            <div key={block.id} className="overflow-hidden rounded-xl bg-white">
              <div className="aspect-[16/9] w-full border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
                Banner Ad 16:9
              </div>
            </div>
          )
        }
        return (
          <div key={block.id} className="overflow-hidden rounded-xl bg-white">
            <div className="h-24 w-full border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
              Banner Ad
            </div>
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
              <CategoryColumns tenantSlug={tenantSlugForLinks} />
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
      if (colKey === 'col-1') return 'space-y-6'
      if (colKey === 'col-4') return 'space-y-4'
      return ''
    }

    return (
      <div key={section.id} className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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
                <FlashTicker tenantSlug={tenantSlugForLinks} items={(tickerItems.length > 0 ? tickerItems : articles).slice(0, 12)} />
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
      <main key={`main-${mainKey++}`} className="mx-auto max-w-7xl px-4 py-6">
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

  return (
    <div className="theme-style1">
      <Navbar tenantSlug={tenantSlugForLinks} title={title} logoUrl={settings?.branding?.logoUrl} />
      {rendered}
      <MobileBottomNav tenantSlug={tenantSlugForLinks} />
      <Footer settings={settings} tenantSlug={tenantSlugForLinks} />
    </div>
  )
}

export async function ThemeArticle({ tenantSlug, title, article }: { tenantSlug: string; title: string; article: Article }) {
  const settings = await getEffectiveSettings()
  return (
    <div className="theme-style1">
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <a href={"/"} className="hover:text-red-600">Home</a>
          <span className="mx-2 text-zinc-300">/</span>
          <span className="text-zinc-700">Article</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main */}
          <article className="min-w-0">
            <h1 className="mb-3 text-2xl font-extrabold leading-tight sm:text-3xl">{article.title}</h1>
            {article.coverImage?.url && (
              <div className="mb-4 overflow-hidden rounded-xl">
                <div className="relative aspect-[16/9] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.coverImage.url} alt={article.title} className="absolute inset-0 h-full w-full object-cover" />
                </div>
              </div>
            )}

            {/* Interleaved content with inline ads */}
            <InterleavedArticle html={article.content ?? ''} />

            {/* Related articles */}
            <div className="mt-8">
              <Section title="Related Articles" noShadow bodyClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <RelatedArticles tenantSlug={tenantSlug} article={article} />
              </Section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="overflow-hidden rounded-xl bg-white p-2">
                <div className="h-[250px] w-[300px] mx-auto border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
                  Ad 300×250
                </div>
              </div>

              <Section title="Latest Articles" noShadow>
                <LatestArticles tenantSlug={tenantSlug} />
              </Section>

              <div className="overflow-hidden rounded-xl bg-white p-2">
                <div className="h-[600px] w-[300px] mx-auto border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
                  Ad 300×600
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer settings={settings} tenantSlug={tenantSlug} />
    </div>
  )
}

function getAdEveryN() {
  const raw = Number(process.env.NEXT_PUBLIC_ARTICLE_AD_EVERY_N_PARAGRAPHS || '3')
  if (Number.isFinite(raw) && raw >= 1) return Math.floor(raw)
  return 3
}

function HorizontalInlineAd() {
  return (
    <div className="my-6">
      <div className="overflow-hidden rounded-xl bg-white">
        <div className="h-24 w-full border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
          Article Inline Ad 728×90
        </div>
      </div>
    </div>
  )
}

function InterleavedArticle({ html }: { html: string }) {
  if (!html) return null
  const parts = html.split(/<\/p>/i)
  const every = getAdEveryN()
  const nodes: ReactNode[] = []
  let paraIndex = 0
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i]
    if (chunk.trim().length === 0) continue
    const closed = chunk.endsWith('</p>') ? chunk : chunk + '</p>'
    nodes.push(<div key={`p-${i}`} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: closed }} />)
    paraIndex++
    if (paraIndex % every === 0 && i < parts.length - 1) {
      nodes.push(<HorizontalInlineAd key={`ad-${i}`} />)
    }
  }
  return <>{nodes}</>
}

 

async function LatestArticles({ tenantSlug }: { tenantSlug: string }) {
  const items = await getHomeFeed('na')
  return (
    <div>
      {items.slice(0, 8).map((a) => (
        <a key={a.id} href={articleHref(tenantSlug, a.slug || a.id)} className="block px-3 py-2 border-b border-zinc-100 last:border-b-0 text-sm font-medium leading-snug hover:text-red-600 line-clamp-2">
          {a.title}
        </a>
      ))}
    </div>
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
        <a key={a.id} href={articleHref(tenantSlug, a.slug || a.id)} className="group block overflow-hidden rounded-xl bg-white">
          <div className="relative aspect-[16/9] w-full">
            {a.coverImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            ) : (
              <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
          <div className="p-3 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-red-600">{a.title}</div>
        </a>
      ))}
    </>
  )
}

async function CategoryColumns({ tenantSlug }: { tenantSlug: string }) {
  const cats: Category[] = await getCategoriesForNav()
  const chosen = cats.slice(0, 4)
  const lists = await Promise.all(
    chosen.map(async (c) => ({
      category: c,
      items: (await getArticlesByCategory('na', c.slug)).slice(0, 5),
    }))
  )
  return (
    <>
      {lists.map(({ category: c, items }) => (
        <section key={c.id} className="rounded-xl bg-white">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <Link href={toHref(categoryHref(tenantSlug, c.slug))} className="inline-flex items-center gap-2">
              <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
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
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded">
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

async function TrendingCategoryBlock({ tenantSlug }: { tenantSlug: string }) {
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
          <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
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
        {/* Compact two-column rows (no featured image here) */}
        {items.map((a) => (
          <div key={a.id} className="grid grid-cols-[160px_1fr] items-center gap-3">
            <div className="relative h-24 w-40 overflow-hidden rounded">
              {a.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
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
}

async function WebStoriesArea({ tenantSlug }: { tenantSlug: string }) {
  const cats: Category[] = await getCategoriesForNav()
  const preferred = (process.env.NEXT_PUBLIC_WEBSTORIES_CATEGORY || '').trim().toLowerCase()
  const category = preferred
    ? cats.find((c) => c.slug.toLowerCase() === preferred || c.name.toLowerCase() === preferred) || cats[0]
    : cats[0]
  const items = category ? (await getArticlesByCategory('na', category.slug)).slice(0, 8) : []
  void items
  const moreHref = category ? categoryHref(tenantSlug, category.slug) : undefined

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left column: Web Stories then HG block */}
      <div className="space-y-6">
        <Section title="Web Stories" noShadow viewMoreHref={moreHref}
        >
          <WebStoriesGrid />
          {/* Inline player demo for instant playback */}
          <div className="mt-6">
            <WebStoriesPlayer height={560} />
          </div>
        </Section>

        {/* HG block below stories */}
        <HGBlock tenantSlug={tenantSlug} />
      </div>

      {/* Right: Sticky vertical ads shared for both blocks */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="overflow-hidden rounded-xl bg-white p-2">
            <div className="h-[600px] w-[300px] mx-auto border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
              Vertical Ad 300×600
            </div>
          </div>
          <div className="overflow-hidden rounded-xl bg-white p-2">
            <div className="h-[250px] w-[300px] mx-auto border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
              Vertical Ad 300×250
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

async function HGBlock({ tenantSlug }: { tenantSlug: string }) {
  const cats: Category[] = await getCategoriesForNav()
  const chosen = cats.slice(0, 2)
  const lists = await Promise.all(
    chosen.map(async (c) => ({
      category: c,
      items: (await getArticlesByCategory('na', c.slug)).slice(0, 5),
    }))
  )

  return (
    <Section title="" noShadow>
      {lists.map(({ category: c, items }, idx) => (
        <div key={c.id} className={idx > 0 ? 'mt-6' : ''}>
          <div className="flex items-center justify-between px-3 py-2">
            <a href={categoryHref(tenantSlug, c.slug)} className="inline-flex items-center gap-2 text-base font-bold">
              <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
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
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md">
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
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                    {featured.coverImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featured.coverImage.url} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-lg font-extrabold leading-snug line-clamp-2 drop-shadow-md">{featured.title}</h3>
                    </div>
                  </div>
                </a>

                {/* Four small cards */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {rest.map((a) => (
                    <a key={a.id} href={articleHref(tenantSlug, a.slug || a.id)} className="group block">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
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


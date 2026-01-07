import { Footer } from '@/components/shared'
import { Navbar } from '@/components/shared/Navbar'
import { FlashTicker } from '@/components/shared/FlashTicker'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import { TopStoriesTilesCarouselClient } from '@/components/shared/TopStoriesTilesCarouselClient'
import MobileBottomNav from '@/components/shared/MobileBottomNav'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import Link from 'next/link'
import type { UrlObject } from 'url'
import { articleHref, categoryHref } from '@/lib/url'
import { getTenantFromHeaders } from '@/lib/tenant'
import { getArticlesByCategory, getHomeFeed } from '@/lib/data'
import { getPublicHomepageStyle2ShapeForDomain, getPublicHomepageStyle2Shape, type Style2HomepageItem, type Style2HomepageResponse } from '@/lib/homepage'
import { readHomeLayout, type HomeBlock, type HomeSection } from '@/lib/home-layout'
import { getCategoriesForNav, type Category } from '@/lib/categories'
import { getEffectiveSettings } from '@/lib/settings'
import { themeCssVarsFromSettings } from '@/lib/theme-vars'

function style2ItemToArticle(item: Style2HomepageItem): Article {
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    excerpt: item.excerpt || undefined,
    publishedAt: item.publishedAt || undefined,
    coverImage: item.image ? { url: item.image } : undefined,
  } as Article
}

function buildStyle2CategoryMap(home: Style2HomepageResponse | null): Map<string, Article[]> {
  const map = new Map<string, Article[]>()
  const sections = Array.isArray(home?.sections) ? home!.sections! : []
  for (const section of sections) {
    const slug = String(section?.categorySlug || '').trim()
    if (!slug) continue
    const items = Array.isArray(section.items) ? section.items : []
    if (!items.length) continue
    map.set(slug, items.map(style2ItemToArticle))
  }
  return map
}

function buildStyle2HomeFeed(home: Style2HomepageResponse | null): Article[] {
  const seen = new Set<string>()
  const out: Article[] = []
  const push = (a: Article) => {
    if (!a?.id) return
    if (seen.has(a.id)) return
    seen.add(a.id)
    out.push(a)
  }

  const hero = Array.isArray(home?.hero) ? home!.hero! : []
  const topStories = Array.isArray(home?.topStories) ? home!.topStories! : []
  for (const i of hero) push(style2ItemToArticle(i))
  for (const i of topStories) push(style2ItemToArticle(i))

  const sections = Array.isArray(home?.sections) ? home!.sections! : []
  const sorted = [...sections].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
  for (const s of sorted) {
    const items = Array.isArray(s.items) ? s.items : []
    for (const i of items) push(style2ItemToArticle(i))
  }

  return out
}

function toHref(pathname: string): UrlObject {
  return { pathname }
}

function SectionCard({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden bg-white border-b border-zinc-200">
      {/* Classic header with left accent bar */}
      <div className="flex items-center justify-between border-b-2 border-[hsl(var(--primary,217_91%_60%))] pb-2 mb-4">
        {href ? (
          <h2 className="text-lg font-bold text-black uppercase tracking-wide flex items-center gap-2">
            {title}
          </h2>
        ) : (
          <h2 className="text-lg font-bold text-black uppercase tracking-wide">{title}</h2>
        )}
        {href ? (
          <Link href={toHref(href)} className="text-xs font-semibold text-[hsl(var(--primary,217_91%_60%))] hover:underline">
            View All →
          </Link>
        ) : null}
      </div>
      <div className="pb-4">{children}</div>
    </section>
  )
}

function LeadStory({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="lead-story group bg-white">
      <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
          {a.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={a.coverImage.url} 
              alt={a.title} 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" 
            />
          ) : (
            <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
        <div className="pt-3">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight text-black group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors">
            {a.title}
          </h1>
          {a.excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
              {a.excerpt}
            </p>
          ) : null}
          {a.publishedAt ? (
            <time className="mt-2 text-xs text-zinc-500 block">
              {new Date(String(a.publishedAt)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

function CompactStory({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group flex gap-3 py-3 border-b border-zinc-100 last:border-b-0">
      <div className="h-16 w-24 shrink-0 overflow-hidden bg-zinc-100">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={a.coverImage.url} 
            alt={a.title} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <PlaceholderImg className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <Link
          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
          className="line-clamp-2 text-sm font-semibold leading-snug text-black group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors"
        >
          {a.title}
        </Link>
        {a.publishedAt ? (
          <time className="mt-1 text-xs text-zinc-500">
            {new Date(String(a.publishedAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </time>
        ) : null}
      </div>
    </article>
  )
}

function TitleList({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  return (
    <div className="title-list">
      {items.map((a, idx) => (
        <Link
          key={a.id}
          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
          className="group flex items-start gap-3 py-2.5 border-b border-zinc-100 last:border-b-0"
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-[hsl(var(--primary,217_91%_60%))] text-[10px] font-bold text-white">
            {idx + 1}
          </span>
          <span className="text-sm font-medium leading-snug text-black group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors line-clamp-2">
            {a.title}
          </span>
        </Link>
      ))}
    </div>
  )
}

function SmallCardList({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  return (
    <div className="small-card-list">
      {items.map((a) => (
        <article key={a.id} className="group flex gap-3 py-2.5 border-b border-zinc-100 last:border-b-0">
          <div className="h-14 w-20 shrink-0 overflow-hidden bg-zinc-100">
            {a.coverImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={a.coverImage.url} 
                alt={a.title} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <PlaceholderImg className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex flex-col justify-center flex-1">
            <Link
              href={toHref(articleHref(tenantSlug, a.slug || a.id))}
              className="line-clamp-2 text-sm font-medium text-black group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors"
            >
              {a.title}
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}

/* ==================== STYLED CATEGORY SECTIONS ==================== */

// Style 1: Classic horizontal scroll section
function BlueCategorySection({ 
  tenantSlug, 
  title, 
  href, 
  items 
}: { 
  tenantSlug: string
  title: string
  href?: string
  items: Article[] 
}) {
  return (
    <section className="bg-white py-6 border-t border-zinc-200">
      {/* Classic header */}
      <div className="flex items-center justify-between border-b-2 border-[hsl(var(--primary,217_91%_60%))] pb-2 mb-4">
        <h2 className="text-lg font-bold text-black uppercase tracking-wide">{title}</h2>
        {href && (
          <Link href={toHref(href)} className="text-xs font-semibold text-[hsl(var(--primary,217_91%_60%))] hover:underline">
            View All →
          </Link>
        )}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.slice(0, 6).map((a) => (
          <Link 
            key={a.id}
            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
            className="group flex-shrink-0 w-[180px] sm:w-[200px]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
              {a.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={a.coverImage.url} 
                  alt={a.title} 
                  className="absolute inset-0 h-full w-full object-cover" 
                />
              ) : (
                <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
            <h3 className="mt-2 text-sm font-semibold text-black line-clamp-2 group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors">
              {a.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  )
}

// Style 2: Featured + list layout (classic)
function RedCategorySection({ 
  tenantSlug, 
  title, 
  href, 
  items 
}: { 
  tenantSlug: string
  title: string
  href?: string
  items: Article[] 
}) {
  const featured = items[0]
  const list = items.slice(1, 5)
  
  return (
    <section className="bg-white py-6 border-t border-zinc-200">
      {/* Classic header */}
      <div className="flex items-center justify-between border-b-2 border-[hsl(var(--primary,217_91%_60%))] pb-2 mb-4">
        <h2 className="text-lg font-bold text-black uppercase tracking-wide">{title}</h2>
        {href && (
          <Link href={toHref(href)} className="text-xs font-semibold text-[hsl(var(--primary,217_91%_60%))] hover:underline">
            View All →
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured article */}
        {featured && (
          <Link 
            href={toHref(articleHref(tenantSlug, featured.slug || featured.id))}
            className="group"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
              {featured.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={featured.coverImage.url} 
                  alt={featured.title} 
                  className="absolute inset-0 h-full w-full object-cover" 
                />
              ) : (
                <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
            <h3 className="mt-3 text-lg font-bold text-black line-clamp-2 group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors">
              {featured.title}
            </h3>
            {featured.excerpt && (
              <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{featured.excerpt}</p>
            )}
          </Link>
        )}
        
        {/* List of articles */}
        <div>
          {list.map((a, idx) => (
            <Link 
              key={a.id}
              href={toHref(articleHref(tenantSlug, a.slug || a.id))}
              className="group flex items-start gap-3 py-3 border-b border-zinc-100 last:border-b-0"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[hsl(var(--primary,217_91%_60%))] text-xs font-bold text-white">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-black line-clamp-2 group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors">
                  {a.title}
                </h4>
                {a.publishedAt ? (
                  <time className="mt-1 text-xs text-zinc-500">
                    {new Date(String(a.publishedAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </time>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// Style 3: Classic card grid
function DarkCategorySection({ 
  tenantSlug, 
  title, 
  href, 
  items 
}: { 
  tenantSlug: string
  title: string
  href?: string
  items: Article[] 
}) {
  return (
    <section className="bg-white py-6 border-t border-zinc-200">
      {/* Classic header */}
      <div className="flex items-center justify-between border-b-2 border-[hsl(var(--primary,217_91%_60%))] pb-2 mb-4">
        <h2 className="text-lg font-bold text-black uppercase tracking-wide">{title}</h2>
        {href && (
          <Link href={toHref(href)} className="text-xs font-semibold text-[hsl(var(--primary,217_91%_60%))] hover:underline">
            View All →
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.slice(0, 4).map((a) => (
          <Link 
            key={a.id}
            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
            className="group"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
              {a.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={a.coverImage.url} 
                  alt={a.title} 
                  className="absolute inset-0 h-full w-full object-cover" 
                />
              ) : (
                <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
            <h3 className="mt-2 text-sm font-semibold text-black line-clamp-2 group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors">
              {a.title}
            </h3>
            {a.publishedAt ? (
              <time className="mt-1 text-xs text-zinc-500 block">
                {new Date(String(a.publishedAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </time>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  )
}

function pickCount(v: unknown, fallback: number, max = 50) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  const i = Math.floor(n)
  if (i <= 0) return fallback
  return Math.min(max, i)
}

function pickOffset(v: unknown) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  const i = Math.floor(n)
  return i > 0 ? i : 0
}

function resolveCategorySlug(config: Record<string, unknown> | undefined, navCats: Category[]) {
  const c = config || {}
  const source = String(c.categorySource || c.source || '').trim()

  if (source === 'fixed' || source === 'category') {
    const slug = String(c.categorySlug || '').trim()
    return slug || undefined
  }

  if (source === 'env' || source === 'navFirstOrEnv') {
    const envKey = String(c.envCategoryKey || '').trim()
    const fromEnv = envKey ? String(process.env[envKey] || '').trim() : ''
    if (fromEnv) return fromEnv
    if (source === 'navFirstOrEnv') return navCats[0]?.slug
    return undefined
  }

  if (source === 'navByIndex') {
    const idx = Number(c.navIndex)
    const safe = Number.isFinite(idx) ? Math.max(0, Math.floor(idx)) : 0
    return navCats[safe]?.slug
  }

  // Default: first nav category if available
  return navCats[0]?.slug
}

async function itemsForBlock({
  block,
  homeFeed,
  navCats,
  byCategorySlug,
}: {
  block: HomeBlock
  homeFeed: Article[]
  navCats: Category[]
  byCategorySlug?: Map<string, Article[]>
}): Promise<{ items: Article[]; categorySlugUsed?: string }> {
  const cfg = (block.config || {}) as Record<string, unknown>
  const source = String(cfg.source || '').trim()
  const count = pickCount(cfg.count ?? cfg.maxItems, 12)
  const offset = pickOffset(cfg.offset)

  if (source === 'category') {
    const slug = resolveCategorySlug({ ...cfg, categorySource: 'category' }, navCats)
    if (!slug) return { items: [] }
    const backend = byCategorySlug?.get(slug)
    if (backend?.length) return { items: backend.slice(offset, offset + count), categorySlugUsed: slug }
    const list = await getArticlesByCategory('na', slug)
    return { items: list.slice(offset, offset + count), categorySlugUsed: slug }
  }

  // Latest/home feed
  return { items: homeFeed.slice(offset, offset + count) }
}

function findCategoryByMatch(match: string | undefined, navCats: Category[]) {
  const q = String(match || '').trim().toLowerCase()
  if (!q) return undefined
  return (
    navCats.find((c) => c.slug.toLowerCase() === q) ||
    navCats.find((c) => c.name.toLowerCase() === q) ||
    navCats.find((c) => c.name.toLowerCase().includes(q))
  )
}

function clampInt(v: unknown, fallback: number, min: number, max: number) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  const i = Math.floor(n)
  return Math.min(max, Math.max(min, i))
}

async function resolveSectionCardItems({
  tenantSlug,
  homeFeed,
  topNavCats,
  title,
  match,
  categorySlug,
  navIndexFallback,
  itemsPerCard,
  fallbackStart,
  byCategorySlug,
}: {
  tenantSlug: string
  homeFeed: Article[]
  topNavCats: Category[]
  title: string
  match?: string
  categorySlug?: string
  navIndexFallback: number
  itemsPerCard: number
  fallbackStart: number
  byCategorySlug?: Map<string, Article[]>
}): Promise<{ title: string; href?: string; featured?: Article; links: Article[] }> {
  const cat =
    (categorySlug ? topNavCats.find((x) => x.slug === categorySlug) : undefined) ||
    findCategoryByMatch(match, topNavCats) ||
    topNavCats[Math.max(0, Math.floor(navIndexFallback))]

  let items: Article[] = []
  if (cat?.slug) {
    const backend = byCategorySlug?.get(cat.slug)
    if (backend?.length) {
      items = backend.slice(0, itemsPerCard)
    } else {
      items = (await getArticlesByCategory('na', cat.slug)).slice(0, itemsPerCard)
    }
  }
  if (!items.length) items = homeFeed.slice(fallbackStart, fallbackStart + itemsPerCard)

  const href = cat?.slug ? categoryHref(tenantSlug, cat.slug) : undefined
  return { title, href, featured: items[0], links: items.slice(1, 5) }
}

function SectionCardTOI({
  tenantSlug,
  title,
  href,
  featured,
  links,
}: {
  tenantSlug: string
  title: string
  href?: string
  featured?: Article
  links: Article[]
}) {
  const flat = links

  return (
    <div className="min-w-0 bg-white">
      {/* Header with underline accent */}
      <div className="flex items-center justify-between border-b-2 border-[hsl(var(--primary,217_91%_60%))] pb-2 mb-3">
        <h3 className="text-base font-bold text-black uppercase tracking-wide">
          {href ? (
            <Link href={toHref(href)} className="hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {href ? (
          <Link href={toHref(href)} className="text-xs font-semibold text-[hsl(var(--primary,217_91%_60%))] hover:underline">
            More →
          </Link>
        ) : null}
      </div>

      <div>
        {/* Featured Image */}
        {featured ? (
          <Link href={toHref(articleHref(tenantSlug, featured.slug || featured.id))} className="block group mb-3">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
              {featured.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.coverImage.url} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
            <h4 className="mt-2 text-sm font-bold text-black group-hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors line-clamp-2">{featured.title}</h4>
          </Link>
        ) : null}

        {/* Article list */}
        <div>
          {flat.map((a) => (
            <Link
              key={a.id}
              href={toHref(articleHref(tenantSlug, a.slug || a.id))}
              className="group flex items-start gap-2 py-2 border-b border-zinc-100 last:border-b-0"
            >
              <span className="w-1.5 h-1.5 mt-1.5 bg-[hsl(var(--primary,217_91%_60%))] flex-shrink-0" />
              <span className="text-sm font-medium text-black group-hover:text-[hsl(var(--primary,217_91%_60%))] line-clamp-2">
                {a.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function activeBlocksForSection(section: HomeSection) {
  return (section.blocks || []).filter((b) => b.isActive).slice().sort((a, b) => a.position - b.position)
}

export async function ThemeHome({
  tenantSlug,
  title,
  articles,
  settings,
  tenantDomain,
}: {
  tenantSlug: string
  title: string
  articles: Article[]
  settings?: EffectiveSettings
  tenantDomain?: string
}) {
  const layout = await readHomeLayout(tenantSlug, 'style2')
  const navCats = await getCategoriesForNav()
  const topNavCats = navCats.filter((c) => !c.parentId)

  const activeSections = (layout.sections || [])
    .filter((s) => s && s.isActive)
    .slice()
    .sort((a, b) => a.position - b.position)

  // Home feed should already be passed, but keep a fallback for safety.
  const style2Home = await (tenantDomain
    ? getPublicHomepageStyle2ShapeForDomain(tenantDomain)
    : getPublicHomepageStyle2Shape()
  ).catch(() => null)
  const byCategorySlug = buildStyle2CategoryMap(style2Home)
  const style2Feed = buildStyle2HomeFeed(style2Home)
  const style2Hero = Array.isArray(style2Home?.hero) ? style2Home!.hero!.map(style2ItemToArticle) : []
  const style2TopStories = Array.isArray(style2Home?.topStories) ? style2Home!.topStories!.map(style2ItemToArticle) : []

  const homeFeed = style2Feed.length
    ? style2Feed
    : (articles && articles.length > 0 ? articles : await getHomeFeed('na'))

  async function itemsForCategorySlug(slug: string, count: number, offset = 0) {
    const backend = byCategorySlug.get(slug)
    if (backend?.length) return backend.slice(offset, offset + count)
    const list = await getArticlesByCategory('na', slug)
    return list.slice(offset, offset + count)
  }

  async function renderBlock(block: HomeBlock): Promise<React.ReactNode | null> {
    if (!block.isActive) return null

    switch (block.type) {
      case 'heroLead': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const isCategory = String(cfg.source || '').trim() === 'category'
        const lead = !isCategory && style2Hero.length
          ? style2Hero[0]
          : (await itemsForBlock({ block: { ...block, config: { ...cfg, count: 1, offset: 0 } }, homeFeed, navCats: topNavCats, byCategorySlug })).items[0]
        return lead ? <LeadStory key={block.id} tenantSlug={tenantSlug} a={lead} /> : null
      }
      case 'mediumCards': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const count = pickCount(cfg.count, 2, 6)
        const offset = pickOffset(cfg.offset) || 1
        const { items } = await itemsForBlock({ block: { ...block, config: { ...cfg, count, offset } }, homeFeed, navCats: topNavCats, byCategorySlug })
        return (
          <div key={block.id} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((a) => (
              <CompactStory key={a.id} tenantSlug={tenantSlug} a={a} />
            ))}
          </div>
        )
      }
      case 'smallList': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const count = pickCount(cfg.count, 6, 20)
        const offset = pickOffset(cfg.offset) || 3
        const { items } = await itemsForBlock({ block: { ...block, config: { ...cfg, count, offset } }, homeFeed, navCats: topNavCats, byCategorySlug })
        return (
          <SectionCard key={block.id} title={block.name || 'More Stories'}>
            <SmallCardList tenantSlug={tenantSlug} items={items} />
          </SectionCard>
        )
      }
      case 'categoryBlock': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const slug = resolveCategorySlug(cfg, topNavCats)
        const count = pickCount(cfg.count ?? cfg.maxItems, 8, 30)
        const items = slug ? await itemsForCategorySlug(slug, count, 0) : []
        const href = slug ? categoryHref(tenantSlug, slug) : undefined
        const listStyle = String(cfg.listStyle || '').trim().toLowerCase()
        return (
          <SectionCard key={block.id} title={block.name || 'Category'} href={href}>
            {listStyle === 'cards' ? (
              <SmallCardList tenantSlug={tenantSlug} items={items} />
            ) : (
              <TitleList tenantSlug={tenantSlug} items={items} />
            )}
          </SectionCard>
        )
      }
      case 'trendingList': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const count = pickCount(cfg.count ?? cfg.maxItems, 10, 30)
        const offset = pickOffset(cfg.offset)

        // Optional: make this list category-driven (so title becomes a category link).
        if (String(cfg.source || '').trim() === 'category') {
          const slug = resolveCategorySlug(cfg, topNavCats)
          const items = slug ? await itemsForCategorySlug(slug, count, offset) : []
          const href = slug ? categoryHref(tenantSlug, slug) : undefined
          return (
            <SectionCard key={block.id} title={block.name || 'Category'} href={href}>
              <TitleList tenantSlug={tenantSlug} items={items} />
            </SectionCard>
          )
        }

        const items = homeFeed.slice(offset, offset + count)
        return (
          <SectionCard key={block.id} title={block.name || 'Latest'}>
            <TitleList tenantSlug={tenantSlug} items={items} />
          </SectionCard>
        )
      }
      case 'articleGrid': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const isTopStoriesGrid = block.key === 'topStoriesGrid' || block.id === 'b-top-stories-grid'
        const count = isTopStoriesGrid ? 9 : pickCount(cfg.count ?? cfg.maxItems, 3, 30)
        const offset = pickOffset(cfg.offset)
        const cols = isTopStoriesGrid ? 3 : pickCount(cfg.columns, 3, 6)
        let items: Article[] = []
        let href: string | undefined

        // Optional: category-driven grid (adds a category link on the section title).
        if (String(cfg.source || '').trim() === 'category') {
          const slug = resolveCategorySlug(cfg, topNavCats)
          if (slug) {
            items = await itemsForCategorySlug(slug, count, offset)
            href = categoryHref(tenantSlug, slug)
          }
        }

        if (!items.length && isTopStoriesGrid && String(cfg.source || '').trim() !== 'category' && style2TopStories.length) {
          items = style2TopStories.slice(offset, offset + count)
          if (!items.length && offset > 0) items = style2TopStories.slice(0, count)
        }

        if (!items.length) {
          items = homeFeed.slice(offset, offset + count)
          if (!items.length && offset > 0) items = homeFeed.slice(0, count)
        }
        const gridClass = cols >= 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

        if (isTopStoriesGrid) {
          const top = items.slice(0, 3)
          const tiles = items.slice(3, 9)
          return (
            <SectionCard key={block.id} title={block.name || 'Top Stories'} href={href}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {top.map((a, idx) => (
                    <article key={a.id} className="group overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-zinc-100">
                      <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="block">
                        <div className="relative aspect-[16/9] w-full overflow-hidden">
                          {a.coverImage?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                          )}
                          <div className="absolute top-2 left-2">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-blue-600 text-white rounded shadow-sm">
                              #{idx + 1}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-800 group-hover:text-blue-600 transition-colors">
                            {a.title}
                          </h3>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
                <TopStoriesTilesCarouselClient tenantSlug={tenantSlug} items={tiles} />
              </div>
            </SectionCard>
          )
        }

        return (
          <SectionCard key={block.id} title={block.name || 'Top Stories'} href={href}>
            <div className={`grid ${gridClass} gap-4`}>
              {items.map((a) => (
                <article key={a.id} className="group overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-zinc-100">
                  <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="block">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      {a.coverImage?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-800 group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </SectionCard>
        )
      }
      case 'section3': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const colsCfg = (Array.isArray(cfg.columns) ? cfg.columns : []) as Array<Record<string, unknown>>
        const itemsPerColumnRaw = Number(cfg.itemsPerColumn)
        const itemsPerColumn = Number.isFinite(itemsPerColumnRaw) && itemsPerColumnRaw > 0 ? Math.min(6, Math.floor(itemsPerColumnRaw)) : 3

        const defaults: Array<Record<string, unknown>> = [
          { title: 'Technology', match: 'technology', navIndexFallback: 0 },
          { title: 'Education', match: 'education', navIndexFallback: 1 },
          { title: 'Also In News', match: 'news', navIndexFallback: 2 },
        ]

        const columns = (colsCfg.length ? colsCfg : defaults).slice(0, 3)

        const colsData = await Promise.all(
          columns.map(async (c, idx) => {
            const title = String(c['title'] || defaults[idx]?.title || `Section ${idx + 1}`).trim()
            const categorySlug = String(c['categorySlug'] || '').trim()
            const match = String(c['match'] || '').trim()
            const navIndexFallback = Number((c['navIndexFallback'] as unknown) ?? defaults[idx]?.navIndexFallback ?? idx)

            const cat =
              (categorySlug ? topNavCats.find((x) => x.slug === categorySlug) : undefined) ||
              findCategoryByMatch(match, topNavCats) ||
              topNavCats[(Number.isFinite(navIndexFallback) ? Math.max(0, Math.floor(navIndexFallback)) : idx)]

            let items: Article[] = []
            if (cat?.slug) {
              items = await itemsForCategorySlug(cat.slug, itemsPerColumn, 0)
            }
            if (!items.length) {
              const start = 3 + idx * itemsPerColumn
              items = homeFeed.slice(start, start + itemsPerColumn)
            }

            return { title, cat, items }
          }),
        )

        return (
          <div key={block.id} className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {colsData.map(({ title, cat, items }, idx) => {
                const featured = items[0]
                const links = items.slice(1, 4)
                const href = cat?.slug ? categoryHref(tenantSlug, cat.slug) : undefined
                return (
                  <div key={idx} className="min-w-0 bg-white">
                    {/* Header with underline */}
                    <div className="flex items-center justify-between border-b-2 border-[hsl(var(--primary,217_91%_60%))] pb-2 mb-3">
                      <h3 className="text-base font-bold text-black uppercase tracking-wide">
                        {href ? (
                          <Link href={toHref(href)} className="hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors">
                            {title}
                          </Link>
                        ) : (
                          title
                        )}
                      </h3>
                      {href ? (
                        <Link href={toHref(href)} className="text-xs font-semibold text-[hsl(var(--primary,217_91%_60%))] hover:underline">
                          More →
                        </Link>
                      ) : null}
                    </div>

                    <div>
                      {/* Featured article */}
                      {featured ? (
                        <div className="flex min-w-0 gap-3 mb-3">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-zinc-100">
                            {featured.coverImage?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={featured.coverImage.url}
                                alt={featured.title}
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            ) : (
                              <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                            )}
                          </div>
                          <Link
                            href={toHref(articleHref(tenantSlug, featured.slug || featured.id))}
                            className="min-w-0 line-clamp-3 text-sm font-bold text-black hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors"
                          >
                            {featured.title}
                          </Link>
                        </div>
                      ) : null}

                      {/* Article list */}
                      <div>
                        {links.map((a) => (
                          <Link
                            key={a.id}
                            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                            className="group flex items-start gap-2 py-2 border-b border-zinc-100 last:border-b-0"
                          >
                            <span className="w-1.5 h-1.5 mt-1.5 bg-[hsl(var(--primary,217_91%_60%))] flex-shrink-0" />
                            <span className="text-sm font-medium text-black group-hover:text-[hsl(var(--primary,217_91%_60%))]">
                              {a.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
      case 'section4': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const rows = clampInt(cfg.rows, 3, 1, 6)
        const cols = clampInt(cfg.cols, 3, 1, 3)
        const itemsPerCard = clampInt(cfg.itemsPerCard, 5, 3, 10)
        const startNavIndex = clampInt(cfg.startNavIndex, 0, 0, 50)

        const cardsCfg = (Array.isArray(cfg.cards) ? cfg.cards : []) as Array<Record<string, unknown>>
        const totalCards = rows * cols

        const defaultCats = topNavCats.slice(startNavIndex, startNavIndex + totalCards)

        const cards = new Array(totalCards)
          .fill(null)
          .map((_, idx) => {
            const c = cardsCfg[idx] || {}
            const titleRaw = String(c['title'] || '').trim()
            const defaultCat = defaultCats[idx]
            const title = titleRaw || defaultCat?.name
            if (!title) return null

            const match = String(c['match'] || '').trim()
            const categorySlug = String(c['categorySlug'] || '').trim()
            const navIndexFallback = Number((c['navIndexFallback'] as unknown) ?? startNavIndex + idx)
            return {
              title,
              match: match || undefined,
              categorySlug: categorySlug || undefined,
              navIndexFallback: Number.isFinite(navIndexFallback) ? navIndexFallback : startNavIndex + idx,
            }
          })
          .filter(Boolean) as Array<{
          title: string
          match?: string
          categorySlug?: string
          navIndexFallback: number
        }>

        const resolvedAll = await Promise.all(
          cards.map((c, idx) =>
            resolveSectionCardItems({
              tenantSlug,
              homeFeed,
              topNavCats,
              title: c.title,
              match: c.match,
              categorySlug: c.categorySlug,
              navIndexFallback: c.navIndexFallback,
              itemsPerCard,
              fallbackStart: 3 + idx * itemsPerCard,
              byCategorySlug,
            }),
          ),
        )

        // Don't show placeholder cards like "Category 7" when there is no content.
        const resolved = resolvedAll.filter((x) => Boolean(x.featured) || (Array.isArray(x.links) && x.links.length > 0))

        if (resolved.length === 0) return null

        const perRow = cols
        const maxCards = rows * cols
        const visible = resolved.slice(0, maxCards)
        const actualRows = Math.max(1, Math.ceil(visible.length / perRow))

        return (
          <div key={block.id} className="border-t border-dotted border-zinc-300 pt-6 sm:pt-8">
            <div className="space-y-10">
              {Array.from({ length: actualRows }).map((_, r) => {
                const rowItems = visible.slice(r * perRow, r * perRow + perRow)
                if (!rowItems.length) return null
                return (
                  <div key={r}>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-dotted lg:divide-zinc-300">
                      {rowItems.map((x, i) => (
                        <div key={`${r}-${i}`} className="min-w-0 lg:px-8 lg:first:pl-0 lg:last:pr-0">
                          <SectionCardTOI tenantSlug={tenantSlug} title={x.title} href={x.href} featured={x.featured} links={x.links} />
                        </div>
                      ))}
                    </div>
                    {r < actualRows - 1 ? <div className="mt-10 border-t border-dotted border-zinc-300" /> : null}
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
      case 'ad':
        {
          const cfg = (block.config || {}) as Record<string, unknown>
          const label = String(cfg.label || 'Advertisement')
          const minHeight = Number(cfg.minHeight)
          const safeMinHeight = Number.isFinite(minHeight) && minHeight > 0 ? Math.min(1200, Math.floor(minHeight)) : 200
          const fill = Boolean(cfg.fill)
          return (
            <div
              key={block.id}
              className="rounded-md border bg-white p-4 text-center text-xs text-zinc-500 h-full"
              style={{ minHeight: `${safeMinHeight}px` }}
            >
              <div className="mb-2 text-[11px] uppercase tracking-wide text-zinc-400">{label}</div>
              <div className={fill ? 'flex h-full items-center justify-center' : 'flex items-center justify-center'}>Ad</div>
            </div>
          )
        }
      case 'flashTicker':
        return null
      default:
        return null
    }
  }

  async function renderSection(section: HomeSection): Promise<{ placement: 'outside' | 'main'; node: React.ReactNode } | null> {
    if (!section.isActive) return null

    if (section.key === 'flashTicker') {
      const b = activeBlocksForSection(section).find((x) => x.type === 'flashTicker')
      const cfg = (b?.config || {}) as Record<string, unknown>
      const maxItems = pickCount(cfg.maxItems, 12, 30)
      return {
        placement: 'outside',
        node: (
          <div key={section.id} className="bg-white">
            <div className="mx-auto max-w-7xl px-4">
              <FlashTicker tenantSlug={tenantSlug} items={homeFeed.slice(0, maxItems)} intervalMs={3200} />
            </div>
          </div>
        ),
      }
    }

    if (section.layout?.type === 'grid') {
      const cols = section.layout.columns.slice().sort((a, b) => a.position - b.position)
      const blocks = activeBlocksForSection(section)
      const blocksByCol = new Map<string, HomeBlock[]>()
      for (const b of blocks) {
        const colKey = b.columnKey || ''
        if (!colKey) continue
        const list = blocksByCol.get(colKey) || []
        list.push(b)
        blocksByCol.set(colKey, list)
      }

      const colTemplate = cols.length === 3 ? 'lg:grid-cols-[260px_minmax(0,1fr)_300px]' : cols.length === 2 ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : 'lg:grid-cols-3'

      const colNodes = await Promise.all(
        cols.map(async (c) => {
          const bs = blocksByCol.get(c.key) || []
          const renderedBlocks = await Promise.all(
            bs.map(async (b) => {
              const node = await renderBlock(b)
              return { block: b, node }
            }),
          )
          const items = renderedBlocks.filter((x) => Boolean(x.node)) as Array<{ block: HomeBlock; node: React.ReactNode }>
          return { key: c.key, items }
        }),
      )

      const isToiMainGrid = section.key === 'toiGrid3' || cols.some((c) => c.key === 'col-center')

      function columnOrderClass(colKey: string) {
        if (!isToiMainGrid) return ''
        if (colKey === 'col-center') return 'order-1 lg:order-2'
        if (colKey === 'col-left') return 'order-2 lg:order-1'
        if (colKey === 'col-right') return 'order-3 lg:order-3'
        return ''
      }

      return {
        placement: 'main',
        node: (
          <div key={section.id} className={`grid grid-cols-1 gap-6 ${colTemplate}`}>
            {colNodes.map((c) => (
              <div key={c.key} className={`min-w-0 flex h-full flex-col gap-6 ${columnOrderClass(c.key)}`.trim()}>
                {c.items.map(({ block, node }) => {
                  const cfg = (block.config || {}) as Record<string, unknown>
                  const fill = block.type === 'ad' && Boolean(cfg.fill)
                  return (
                    <div key={block.id} className={fill ? 'flex-1' : undefined}>
                      {node}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ),
      }
    }

    // Full-width section: render its blocks vertically.
    const blocks = activeBlocksForSection(section)
    const nodes = (await Promise.all(blocks.map((b) => renderBlock(b)))).filter(Boolean) as React.ReactNode[]
    return {
      placement: 'main',
      node: (
        <div key={section.id} className="space-y-6">
          {nodes.map((n, idx) => (
            <div key={idx}>{n}</div>
          ))}
        </div>
      ),
    }
  }

  const parts = (await Promise.all(activeSections.map((s) => renderSection(s)))).filter(Boolean) as Array<{ placement: 'outside' | 'main'; node: React.ReactNode }>

  const rendered: React.ReactNode[] = []
  let mainChunk: React.ReactNode[] = []
  let mainKey = 0

  function flushMain() {
    if (mainChunk.length === 0) return
    rendered.push(
      <main key={`main-${mainKey++}`} className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
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

  const cssVars = themeCssVarsFromSettings(settings)

  // Build data for 3 styled category sections using available categories
  const styledCat1 = topNavCats[0]
  const styledCat2 = topNavCats[1]
  const styledCat3 = topNavCats[2]

  const [styledItems1, styledItems2, styledItems3] = await Promise.all([
    styledCat1?.slug ? (byCategorySlug.get(styledCat1.slug) || await getArticlesByCategory('na', styledCat1.slug)) : homeFeed.slice(0, 6),
    styledCat2?.slug ? (byCategorySlug.get(styledCat2.slug) || await getArticlesByCategory('na', styledCat2.slug)) : homeFeed.slice(6, 12),
    styledCat3?.slug ? (byCategorySlug.get(styledCat3.slug) || await getArticlesByCategory('na', styledCat3.slug)) : homeFeed.slice(12, 18),
  ])

  return (
    <div className="theme-style2 pb-16 sm:pb-0" style={cssVars}>
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} variant="style2" />

      {rendered}

      {/* 3 Styled Category Sections */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Blue Category Section */}
        {styledItems1.length > 0 && (
          <BlueCategorySection 
            tenantSlug={tenantSlug}
            title={styledCat1?.name || 'Trending Now'}
            href={styledCat1?.slug ? categoryHref(tenantSlug, styledCat1.slug) : undefined}
            items={styledItems1.slice(0, 6)}
          />
        )}

        {/* Red Category Section */}
        {styledItems2.length > 0 && (
          <RedCategorySection 
            tenantSlug={tenantSlug}
            title={styledCat2?.name || 'Breaking News'}
            href={styledCat2?.slug ? categoryHref(tenantSlug, styledCat2.slug) : undefined}
            items={styledItems2.slice(0, 5)}
          />
        )}

        {/* Dark Elegant Section */}
        {styledItems3.length > 0 && (
          <DarkCategorySection 
            tenantSlug={tenantSlug}
            title={styledCat3?.name || 'Must Read'}
            href={styledCat3?.slug ? categoryHref(tenantSlug, styledCat3.slug) : undefined}
            items={styledItems3.slice(0, 4)}
          />
        )}
      </section>

      <Footer settings={settings} tenantSlug={tenantSlug} />
      <MobileBottomNav tenantSlug={tenantSlug} />
    </div>
  )
}

export async function ThemeArticle({ tenantSlug, title, article }: { tenantSlug: string; title: string; article: Article }) {
  const settings = await getEffectiveSettings().catch(() => undefined)
  const cssVars = themeCssVarsFromSettings(settings)
  const tenant = await getTenantFromHeaders()
  const sidebarFeed = await getHomeFeed(tenant.id)
  const sidebarLatest = sidebarFeed.filter((a) => a.id !== article.id).slice(0, 10)

  return (
    <div className="theme-style2 pb-16 sm:pb-0" style={cssVars}>
      <Navbar tenantSlug={tenantSlug} title={title} variant="style2" />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
              <Link href={`/t/${tenantSlug}`} className="hover:text-blue-600 transition-colors">Home</Link>
              <span>›</span>
              <span className="text-zinc-700">Article</span>
            </nav>
            
            {/* Article Header */}
            <header className="mb-6">
              <h1 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-zinc-900">
                {article.title}
              </h1>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                {article.publishedAt ? (
                  <time className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(String(article.publishedAt)).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                ) : null}
                <span className="hidden sm:inline text-zinc-300">|</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  5 min read
                </span>
              </div>
            </header>

            {/* Featured Image */}
            {article.coverImage?.url ? (
              <figure className="mb-6 -mx-4 sm:mx-0">
                <div className="overflow-hidden sm:rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={article.coverImage.url} 
                    alt={article.title} 
                    className="w-full aspect-video object-cover" 
                  />
                </div>
              </figure>
            ) : null}

            {/* Share buttons */}
            <div className="mb-6 flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-500">Share:</span>
              <button className="share-btn w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-blue-600 hover:text-white transition-all" aria-label="Share on Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
              </button>
              <button className="share-btn w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-sky-500 hover:text-white transition-all" aria-label="Share on Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>
              </button>
              <button className="share-btn w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-green-600 hover:text-white transition-all" aria-label="Share on WhatsApp">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-a:text-blue-600 prose-strong:text-zinc-900" dangerouslySetInnerHTML={{ __html: article.content ?? '' }} />

            {/* Tags (placeholder) */}
            <div className="mt-8 pt-6 border-t border-zinc-200">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors">News</span>
                <span className="px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors">Latest</span>
                <span className="px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors">Trending</span>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <SectionCard title="Latest News">
              <TitleList tenantSlug={tenantSlug} items={sidebarLatest} />
            </SectionCard>
            
            {/* Ad placeholder */}
            <div className="sticky top-24">
              <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 text-center">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Advertisement</div>
                <div className="flex items-center justify-center h-[250px] text-zinc-400">
                  <span>Ad Space</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer settings={settings} tenantSlug={tenantSlug} />
      <MobileBottomNav tenantSlug={tenantSlug} />
    </div>
  )
}

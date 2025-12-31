import { Footer } from '@/components/shared/Footer'
import { Navbar } from '@/components/shared/Navbar'
import { FlashTicker } from '@/components/shared/FlashTicker'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import { TopStoriesTilesCarouselClient } from '@/components/shared/TopStoriesTilesCarouselClient'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import Link from 'next/link'
import type { UrlObject } from 'url'
import { articleHref, categoryHref } from '@/lib/url'
import { getTenantFromHeaders } from '@/lib/tenant'
import { getArticlesByCategory, getHomeFeed } from '@/lib/data'
import { getPublicHomepageStyle2Shape, type Style2HomepageItem, type Style2HomepageResponse } from '@/lib/homepage'
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
    <section className="overflow-hidden rounded-md bg-white">
      <div className="px-4 py-3">
        {href ? (
          <h2 className="text-base sm:text-lg font-bold leading-tight tracking-tight" style={{ color: 'hsl(var(--accent))' }}>
            <Link href={toHref(href)} className="hover:underline">
              {title}
            </Link>
          </h2>
        ) : (
          <h2 className="text-base sm:text-lg font-bold leading-tight tracking-tight" style={{ color: 'hsl(var(--accent))' }}>
            {title}
          </h2>
        )}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function LeadStory({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="overflow-hidden rounded-md border bg-white">
      <div className="relative aspect-[16/9] w-full">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <h1 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight">
          <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="hover:underline">
            {a.title}
          </Link>
        </h1>
        {a.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">{a.excerpt}</p> : null}
      </div>
    </article>
  )
}

function CompactStory({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="flex gap-3 rounded-md border bg-white p-3">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImg className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <Link
          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
          className="line-clamp-3 text-sm font-semibold leading-snug hover:underline"
        >
          {a.title}
        </Link>
      </div>
    </article>
  )
}

function TitleList({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <Link
          key={a.id}
          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
          className="block border-b border-dashed border-zinc-200 pb-3 last:border-b-0 last:pb-0 text-sm font-medium leading-snug hover:underline"
        >
          {a.title}
        </Link>
      ))}
    </div>
  )
}

function SmallCardList({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <article key={a.id} className="flex gap-3 border-b border-dashed border-zinc-200 pb-3 last:border-b-0 last:pb-0">
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded">
            {a.coverImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
            ) : (
              <PlaceholderImg className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={toHref(articleHref(tenantSlug, a.slug || a.id))}
              className="line-clamp-3 text-sm font-semibold leading-snug hover:underline"
            >
              {a.title}
            </Link>
          </div>
        </article>
      ))}
    </div>
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
  const left = links.filter((_, idx) => idx % 2 === 0)
  const right = links.filter((_, idx) => idx % 2 === 1)
  const flat = links

  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold leading-tight tracking-tight">
          {href ? (
            <Link href={toHref(href)} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <div className="flex items-center gap-3">
          {href ? (
            <Link href={toHref(href)} className="rounded px-2 py-1 text-xs font-semibold text-zinc-600 hover:underline">
              More
            </Link>
          ) : null}
          {href ? (
            <Link href={toHref(href)} className="rounded px-2 py-1 text-base font-bold leading-tight text-zinc-700" aria-label="Open category">
              ›
            </Link>
          ) : (
            <div className="text-base font-bold leading-tight text-zinc-700">›</div>
          )}
        </div>
      </div>

      {featured ? (
        <Link href={toHref(articleHref(tenantSlug, featured.slug || featured.id))} className="mt-4 block">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-zinc-100">
            {featured.coverImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featured.coverImage.url} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-black/0 px-3 pb-3 pt-10">
              <div className="line-clamp-2 text-sm sm:text-[15px] font-semibold leading-snug text-white">{featured.title}</div>
            </div>
          </div>
        </Link>
      ) : null}

      <div className="mt-4 border-t border-dotted border-zinc-300" />

      {/* Mobile: single-column list for readability */}
      <div className="mt-4 space-y-3 sm:hidden">
        {flat.map((a) => (
          <Link
            key={a.id}
            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
            className="block border-b border-dotted border-zinc-300 pb-3 last:border-b-0 last:pb-0 line-clamp-2 text-sm font-medium leading-snug hover:underline"
          >
            {a.title}
          </Link>
        ))}
      </div>

      {/* Desktop: 2-column list */}
      <div className="mt-4 hidden sm:grid sm:grid-cols-2 sm:divide-x sm:divide-dotted sm:divide-zinc-300">
        <div className="pr-4">
          <div className="space-y-3">
            {left.map((a) => (
              <Link
                key={a.id}
                href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                className="block line-clamp-2 text-sm font-medium leading-snug hover:underline"
              >
                {a.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="pl-4">
          <div className="space-y-3">
            {right.map((a) => (
              <Link
                key={a.id}
                href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                className="block line-clamp-2 text-sm font-medium leading-snug hover:underline"
              >
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function activeBlocksForSection(section: HomeSection) {
  return (section.blocks || []).filter((b) => b.isActive).slice().sort((a, b) => a.position - b.position)
}

export async function ThemeHome({ tenantSlug, title, articles, settings }: { tenantSlug: string; title: string; articles: Article[]; settings?: EffectiveSettings }) {
  const layout = await readHomeLayout(tenantSlug, 'style2')
  const navCats = await getCategoriesForNav()
  const topNavCats = navCats.filter((c) => !c.parentId)

  const activeSections = (layout.sections || [])
    .filter((s) => s && s.isActive)
    .slice()
    .sort((a, b) => a.position - b.position)

  // Home feed should already be passed, but keep a fallback for safety.
  const style2Home = await getPublicHomepageStyle2Shape().catch(() => null)
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
                <div className="-mx-4 h-px bg-zinc-200" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {top.map((a) => (
                    <article key={a.id} className="overflow-hidden rounded-md bg-white shadow-sm">
                      <div className="relative aspect-[16/9] w-full">
                        {a.coverImage?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="p-3">
                        <Link
                          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                          className="line-clamp-2 text-sm font-semibold leading-snug hover:underline"
                        >
                          {a.title}
                        </Link>
                      </div>
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
                <article key={a.id} className="overflow-hidden rounded-md border bg-white">
                  <div className="relative aspect-[16/9] w-full">
                    {a.coverImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.coverImage.url} alt={a.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-3">
                    <Link href={toHref(articleHref(tenantSlug, a.slug || a.id))} className="line-clamp-2 text-sm font-semibold leading-snug hover:underline">
                      {a.title}
                    </Link>
                  </div>
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
          <div key={block.id} className="border-t border-dotted border-zinc-300 pt-4 sm:pt-6">
            <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-3">
              {colsData.map(({ title, cat, items }, idx) => {
                const featured = items[0]
                const links = items.slice(1, 3)
                const href = cat?.slug ? categoryHref(tenantSlug, cat.slug) : undefined
                return (
                  <div key={idx} className="min-w-0">
                    <div className="flex items-center justify-between">
                      {href ? (
                        <h3 className="text-lg font-bold leading-tight tracking-tight">
                          <Link href={toHref(href)} className="hover:underline">
                            {title}
                          </Link>
                        </h3>
                      ) : (
                        <h3 className="text-lg font-bold leading-tight tracking-tight">{title}</h3>
                      )}
                      {href ? (
                        <Link href={toHref(href)} className="text-lg font-bold leading-tight text-zinc-700" aria-label="Open category">
                          ›
                        </Link>
                      ) : (
                        <div className="text-lg font-bold leading-tight text-zinc-700">›</div>
                      )}
                    </div>

                    {featured ? (
                      <div className="mt-4 flex min-w-0 gap-4">
                        <div className="relative h-20 w-28 sm:w-32 shrink-0 overflow-hidden rounded-md bg-zinc-100">
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
                          className="min-w-0 line-clamp-2 text-sm sm:text-base font-semibold leading-snug"
                        >
                          {featured.title}
                        </Link>
                      </div>
                    ) : null}

                    <div className="mt-4 border-t border-dotted border-zinc-300" />

                    <div className="mt-4 space-y-3 sm:hidden">
                      {links.map((a) => (
                        <Link
                          key={a.id}
                          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                          className="block border-b border-dotted border-zinc-300 pb-3 last:border-b-0 last:pb-0 line-clamp-2 text-sm font-medium leading-snug hover:underline"
                        >
                          {a.title}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 hidden sm:grid sm:grid-cols-2 sm:divide-x sm:divide-dotted sm:divide-zinc-300">
                      {links.map((a, i) => (
                        <Link
                          key={a.id}
                          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                          className={
                            i === 0
                              ? 'pr-4 text-sm font-medium leading-snug line-clamp-2 hover:underline'
                              : 'pl-4 text-sm font-medium leading-snug line-clamp-2 hover:underline'
                          }
                        >
                          {a.title}
                        </Link>
                      ))}
                      {links.length === 1 ? <div className="pl-4" /> : null}
                      {links.length === 0 ? (
                        <>
                          <div className="pr-4" />
                          <div className="pl-4" />
                        </>
                      ) : null}
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

      const colTemplate = cols.length === 3 ? 'lg:grid-cols-[280px_minmax(0,1fr)_340px]' : cols.length === 2 ? 'lg:grid-cols-[minmax(0,1fr)_340px]' : 'lg:grid-cols-3'

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

  return (
    <div className="theme-style2" style={cssVars}>
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} variant="style2" />

      {rendered}
      <Footer settings={settings} />
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
    <div className="theme-style2" style={cssVars}>
      <Navbar tenantSlug={tenantSlug} title={title} variant="style2" />
      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            <h1 className="mb-3 text-2xl sm:text-3xl font-bold leading-snug tracking-tight">{article.title}</h1>
            {article.coverImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.coverImage.url} alt={article.title} className="mb-5 w-full rounded-md border" />
            ) : null}
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content ?? '' }} />
          </article>

          <aside className="space-y-6">
            <SectionCard title="Latest News">
              <TitleList tenantSlug={tenantSlug} items={sidebarLatest} />
            </SectionCard>
            <div className="rounded-md border bg-white p-4 text-center text-sm text-zinc-500">Ad</div>
          </aside>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  )
}

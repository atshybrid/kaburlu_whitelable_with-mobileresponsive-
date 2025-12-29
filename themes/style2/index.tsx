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
import { readHomeLayout, type HomeBlock, type HomeSection } from '@/lib/home-layout'
import { getCategoriesForNav, type Category } from '@/lib/categories'
import { getEffectiveSettings } from '@/lib/settings'
import { themeCssVarsFromSettings } from '@/lib/theme-vars'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

function SectionCard({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-md bg-white">
      <div className="px-4 py-2">
        {href ? (
          <Link
            href={toHref(href)}
            className="text-sm font-bold uppercase tracking-wide hover:underline"
            style={{ color: 'hsl(var(--accent))' }}
          >
            {title}
          </Link>
        ) : (
          <div className="text-sm font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--accent))' }}>
            {title}
          </div>
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
        <Link
          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
          className="block text-2xl font-extrabold leading-tight tracking-tight hover:underline"
        >
          {a.title}
        </Link>
        {a.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{a.excerpt}</p> : null}
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
          className="line-clamp-3 text-sm font-semibold leading-tight hover:underline"
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
              className="line-clamp-3 text-sm font-semibold leading-tight hover:underline"
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
}: {
  block: HomeBlock
  homeFeed: Article[]
  navCats: Category[]
}): Promise<{ items: Article[]; categorySlugUsed?: string }> {
  const cfg = (block.config || {}) as Record<string, unknown>
  const source = String(cfg.source || '').trim()
  const count = pickCount(cfg.count ?? cfg.maxItems, 12)
  const offset = pickOffset(cfg.offset)

  if (source === 'category') {
    const slug = resolveCategorySlug({ ...cfg, categorySource: 'category' }, navCats)
    if (!slug) return { items: [] }
    const list = await getArticlesByCategory('na', slug)
    return { items: list.slice(offset, offset + count), categorySlugUsed: slug }
  }

  // Latest/home feed
  return { items: homeFeed.slice(offset, offset + count) }
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
  const homeFeed = articles && articles.length > 0 ? articles : await getHomeFeed('na')

  async function renderBlock(block: HomeBlock): Promise<React.ReactNode | null> {
    if (!block.isActive) return null

    switch (block.type) {
      case 'heroLead': {
        const { items } = await itemsForBlock({ block: { ...block, config: { ...(block.config || {}), count: 1, offset: 0 } }, homeFeed, navCats: topNavCats })
        const lead = items[0]
        return lead ? <LeadStory key={block.id} tenantSlug={tenantSlug} a={lead} /> : null
      }
      case 'mediumCards': {
        const cfg = (block.config || {}) as Record<string, unknown>
        const count = pickCount(cfg.count, 2, 6)
        const offset = pickOffset(cfg.offset) || 1
        const { items } = await itemsForBlock({ block: { ...block, config: { ...cfg, count, offset } }, homeFeed, navCats: topNavCats })
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
        const { items } = await itemsForBlock({ block: { ...block, config: { ...cfg, count, offset } }, homeFeed, navCats: topNavCats })
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
        const items = slug ? (await getArticlesByCategory('na', slug)).slice(0, count) : []
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
        let items = homeFeed.slice(offset, offset + count)
        if (!items.length && offset > 0) items = homeFeed.slice(0, count)
        const gridClass = cols >= 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

        if (isTopStoriesGrid) {
          const top = items.slice(0, 3)
          const tiles = items.slice(3, 9)
          return (
            <SectionCard key={block.id} title={block.name || 'Top Stories'}>
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
          <SectionCard key={block.id} title={block.name || 'Top Stories'}>
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

      return {
        placement: 'main',
        node: (
          <div key={section.id} className={`grid grid-cols-1 gap-6 ${colTemplate}`}>
            {colNodes.map((c) => (
              <div key={c.key} className="min-w-0 flex h-full flex-col gap-6">
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

  const cssVars = themeCssVarsFromSettings(settings)

  return (
    <div className="theme-style2" style={cssVars}>
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} variant="style2" />

      {rendered}
      <Footer />
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
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight">{article.title}</h1>
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
      <Footer />
    </div>
  )
}

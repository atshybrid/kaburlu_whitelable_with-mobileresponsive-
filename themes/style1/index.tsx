import { Footer } from '@/components/shared/Footer'
import { LiveTvEmbed } from '@/components/shared/LiveTvEmbed'
import { Navbar } from '@/components/shared/Navbar'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import { FlashTicker } from '@/components/shared/FlashTicker'
import { articleHref, categoryHref } from '@/lib/url'
import { getCategoriesForNav, type Category } from '@/lib/categories'
import { getArticlesByCategory, getHomeFeed } from '@/lib/data'
import { AdjustableList } from '@/components/shared/AdjustableList'
import { getEffectiveSettings } from '@/lib/settings'
import { WebStoriesPlayer } from '@/components/shared/WebStoriesPlayer'
import { WebStoriesGrid } from '@/components/shared/WebStoriesGrid'
import MobileBottomNav from '@/components/shared/MobileBottomNav'

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
      <Link href={articleHref(tenantSlug, a.slug || a.id) as any} className="block text-2xl font-extrabold leading-tight line-clamp-2">
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
      <Link href={articleHref(tenantSlug, a.slug || a.id) as any} className="block p-3 text-base font-bold leading-snug hover:text-red-600 line-clamp-2">
        {a.title}
      </Link>
    </article>
  )
}

function CardSmall({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group flex gap-3 rounded-md bg-white p-3 hover:shadow-sm transition-shadow">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImg className="h-full w-full object-cover" />
        )}
      </div>
      <Link href={articleHref(tenantSlug, a.slug || a.id) as any} className="line-clamp-3 text-sm font-semibold leading-tight hover:text-red-600">
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
        <div className="flex items-center justify-between border-b px-4 py-2">
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
  const href = category ? (categoryHref(tenantSlug, category.slug) as any) : undefined

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
      <Link href={articleHref(tenantSlug, a.slug || a.id) as any} className="line-clamp-2 text-sm font-semibold leading-tight hover:text-red-600">
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

export function ThemeHome({ tenantSlug, title, articles, settings }: { tenantSlug: string; title: string; articles: Article[]; settings?: EffectiveSettings }) {
  const lead = articles[0]
  const medium = articles.slice(1, 3)
  const small = articles.slice(3, 9)
  const more = articles.slice(9, 30)
  return (
    <div className="theme-style1">
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />
      {/* Flash News strip */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <FlashTicker tenantSlug={tenantSlug} items={articles.slice(0, 12)} />
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Exactly four columns (no spanning) to match positions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Column 1: Hero stack */}
          <div id="left-col" className="space-y-6">
            {lead && <HeroLead tenantSlug={tenantSlug} a={lead} />}
            <div className="grid grid-cols-2 gap-4">
              {medium.map((a) => (
                <CardMedium key={a.id} tenantSlug={tenantSlug} a={a} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {small.slice(0, 3).map((a) => (
                <ListRow key={a.id} tenantSlug={tenantSlug} a={a} />
              ))}
            </div>
          </div>

          {/* Column 2: Category-driven Last News section */}
          <div>
            <CategoryBlock tenantSlug={tenantSlug} />
          </div>

          {/* Column 3: Tranding News category-driven list */}
          <div>
            <TrendingCategoryBlock tenantSlug={tenantSlug} />
          </div>

          {/* Column 4: Top Ad (16:9) + Trending News (titles) + Bottom Ad */}
          <div className="space-y-4">
            {/* Top banner ad 16:9 */}
            <div className="overflow-hidden rounded-xl bg-white">
              <div className="aspect-[16/9] w-full border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
                Banner Ad 16:9
              </div>
            </div>

            {/* Trending News: titles only from latest feed */}
            <Section title="Trending News" noShadow>
              <div>
                {articles.slice(0, 8).map((a) => (
                  <a
                    key={a.id}
                    href={articleHref(tenantSlug, a.slug || a.id)}
                    className="block px-3 py-2 border-b border-zinc-100 last:border-b-0 text-sm font-medium leading-snug hover:text-red-600 line-clamp-2"
                  >
                    {a.title}
                  </a>
                ))}
              </div>
            </Section>
            {/* Bottom banner ad */}
            <div className="overflow-hidden rounded-xl bg-white">
              <div className="h-24 w-full border bg-gray-50 text-center text-sm text-gray-500 flex items-center justify-center">
                Banner Ad
              </div>
            </div>
          </div>
        </div>
        {/* Horizontal ad below hero section */}
        <HorizontalAd className="my-6" label="Horizontal Ad" />
        {/* Categories 4-column section */}
        <div className="mt-8">
            <Section title="" noShadow bodyClassName="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <CategoryColumns tenantSlug={tenantSlug} />
            </Section>
        </div>
        {/* Horizontal ad below Category Hub */}
        <HorizontalAd className="my-6" label="Horizontal Ad" />
        {/* Web Stories + Sticky Ads */}
        <div className="mt-8">
          <WebStoriesArea tenantSlug={tenantSlug} />
        </div>
        {/* Optional additional ad below Web Stories (uncomment if needed) */}
        {false && <HorizontalAd className="my-6" label="Horizontal Ad" />}
      </main>
      {/* Mobile bottom navigation */}
      <MobileBottomNav tenantSlug={tenantSlug} />
      <Footer />
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
      <Footer />
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
    const anyArticle = article as any
    const firstCat = Array.isArray(anyArticle?.categories) ? anyArticle.categories[0]?.category?.slug || anyArticle.categories[0]?.slug : undefined
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
            <Link href={categoryHref(tenantSlug, c.slug) as any} className="inline-flex items-center gap-2">
              <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
              <span className="text-sm font-bold uppercase tracking-wide hover:text-red-600">{c.name}</span>
            </Link>
            <Link
              href={categoryHref(tenantSlug, c.slug) as any}
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
                <Link href={articleHref(tenantSlug, items[0].slug || items[0].id) as any} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-red-600">
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
                  href={articleHref(tenantSlug, a.slug || a.id) as any}
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
  const title = category ? category.name : 'Tranding News'
  const href = category ? categoryHref(tenantSlug, category.slug) : undefined

  return (
    <section className="mb-8 rounded-xl bg-white">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="inline-flex items-center gap-2">
          <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
          {href ? (
            <a href={href as any} className="text-sm font-bold uppercase tracking-wide hover:text-red-600">
              {title}
            </a>
          ) : (
            <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
          )}
        </div>
        {href ? (
          <a href={href as any} className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50">
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
  const moreHref = category ? (categoryHref(tenantSlug, category.slug) as any) : undefined

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
            <a href={categoryHref(tenantSlug, c.slug) as any} className="inline-flex items-center gap-2 text-base font-bold">
              <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
              <span className="hover:text-red-600">{c.name}</span>
            </a>
            <a
              href={categoryHref(tenantSlug, c.slug) as any}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
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


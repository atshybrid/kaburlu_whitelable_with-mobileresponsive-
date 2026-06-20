import Link from 'next/link'
import type { ReactNode } from 'react'
import { Footer, TechnicalIssues, ReadingProgress, ShareButtons } from '@/components/shared'
import { Navbar } from '@/components/shared/Navbar'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import MobileBottomNav from '@/components/shared/MobileBottomNav'
import { FlashTicker } from '@/components/shared/FlashTicker'
import ArticleEngagementClient from '@/components/shared/ArticleEngagementClient'
import { AdSlot } from '@/components/ads/AdSlot'
import { AeoContentBlocks } from '@/components/seo'
import { resolveArticleBodyHtml } from '@/lib/article-body'
import type { Article } from '@/lib/data-sources'
import {
  getRelatedArticles,
  getTrendingArticles,
} from '@/lib/data-sources'
import { getHomeFeed } from '@/lib/data'
import { feedItemsToArticles, getPublicHomepage, getPublicHomepageForDomain } from '@/lib/homepage'
import type { EffectiveSettings } from '@/lib/remote'
import { getEffectiveSettings } from '@/lib/settings'
import { themeCssVarsFromSettings } from '@/lib/theme-vars'
import { getAdsPlacementPolicy, getAdsSettings, resolveProvider } from '@/lib/ads'
import {
  articleHrefFromArticle,
  categoryHref,
  getCategorySlugFromArticle,
  homeHref,
} from '@/lib/url'

/* ==================== HELPERS ==================== */

function formatViewCount(count?: number): string | null {
  if (typeof count !== 'number' || count <= 0) return null
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toLocaleString('te-IN')
}

function formatPostDate(iso?: string | null, variant: 'full' | 'short' = 'short'): string | null {
  if (!iso) return null
  try {
    return new Date(String(iso)).toLocaleDateString(
      'te-IN',
      variant === 'full'
        ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        : { month: 'short', day: 'numeric', year: 'numeric' },
    )
  } catch {
    return null
  }
}

function pickCategoryName(article: Article): string {
  const raw = article.category?.name || article.categories?.[0]?.name
  return typeof raw === 'string' && raw.trim() ? raw : 'వార్త'
}

function pickAuthor(article: Article): string {
  return (
    article.reporter?.name ||
    article.authors?.[0]?.name ||
    (article as { author?: { name?: string } }).author?.name ||
    'Kaburlu Media'
  )
}

function coverUrl(article: Article): string | undefined {
  return article.coverImage?.url || undefined
}

function ArticleMetaLine({
  publishedAt,
  viewCount,
  className = '',
}: {
  publishedAt?: string | null
  viewCount?: number
  className?: string
}) {
  const date = formatPostDate(publishedAt)
  const views = formatViewCount(viewCount)
  if (!date && !views) return null
  return (
    <div className={`s3-meta-line flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 ${className}`}>
      {date ? (
        <time dateTime={publishedAt ?? undefined} className="inline-flex items-center gap-1">
          <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {date}
        </time>
      ) : null}
      {views ? (
        <span className="inline-flex items-center gap-1">
          <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {views} వీక్షణలు
        </span>
      ) : null}
    </div>
  )
}

function AdLabel() {
  return (
    <p className="text-center text-[9px] font-medium text-slate-400 uppercase tracking-[0.18em] mb-1">Advertisement</p>
  )
}

function CoverImage({
  article,
  className = '',
  priority = false,
}: {
  article: Article
  className?: string
  priority?: boolean
}) {
  const url = coverUrl(article)
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={article.title}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }
  return <PlaceholderImg className={className} />
}

/* ==================== HOME COMPONENTS ==================== */

function FeaturedHero({ tenantSlug, article }: { tenantSlug: string; article: Article }) {
  const href = articleHrefFromArticle(tenantSlug, article)
  return (
    <article className="lg:col-span-2 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-slate-100">
      <Link href={href} className="group block">
        <div className="relative w-full h-[280px] sm:h-[380px] overflow-hidden bg-slate-100">
          <CoverImage article={article} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" priority />
          <span className="absolute top-4 left-4 s3-badge">{pickCategoryName(article)}</span>
        </div>
        <div className="p-5 sm:p-6">
          <h1 className="s3-headline text-xl sm:text-3xl font-black text-slate-900 leading-tight group-hover:text-[hsl(var(--primary))] transition line-clamp-3">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="text-slate-600 text-sm mt-3 line-clamp-2 leading-relaxed">{article.excerpt}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-medium">
            <span>{pickAuthor(article)}</span>
            {article.publishedAt ? (
              <>
                <span aria-hidden>•</span>
                <time dateTime={article.publishedAt}>{formatPostDate(article.publishedAt)}</time>
              </>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}

function TrendingPanel({
  tenantSlug,
  items,
  settings,
  showInlineAd,
}: {
  tenantSlug: string
  items: Article[]
  settings?: EffectiveSettings
  showInlineAd: boolean
}) {
  if (!items.length) return null
  return (
    <aside className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      <h2 className="text-lg font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-2 mb-4 tracking-tight flex items-center gap-2">
        <span aria-hidden>🔥</span> ట్రెండింగ్ వార్తలు
      </h2>
      <div className="space-y-4 flex-1">
        {items.map((item, index) => (
          <div key={item.id} className="group border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <span className="s3-rank-num">#{index + 1}</span>
            <Link
              href={articleHrefFromArticle(tenantSlug, item)}
              className="s3-trend-title font-bold text-sm text-slate-800 group-hover:text-[hsl(var(--primary))] transition line-clamp-2 leading-snug"
            >
              {item.title}
            </Link>
            <ArticleMetaLine publishedAt={item.publishedAt} viewCount={item.viewCount} className="mt-1" />
          </div>
        ))}
      </div>
      {showInlineAd ? (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <AdLabel />
          <div className="overflow-hidden rounded-xl bg-amber-50/50 border border-amber-100 min-h-[120px]">
            <AdSlot slot="home_right_2" settings={settings} className="w-full" />
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function GridCard({ tenantSlug, article }: { tenantSlug: string; article: Article }) {
  const href = articleHrefFromArticle(tenantSlug, article)
  return (
    <article className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
      <Link href={href} className="group flex flex-col h-full">
        <div className="relative w-full h-48 overflow-hidden bg-slate-100">
          <CoverImage article={article} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="s3-card-title font-bold text-base text-slate-900 group-hover:text-[hsl(var(--primary))] transition line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <span className="text-[11px] font-semibold text-slate-400 mt-3 block">
            {pickCategoryName(article)}
            {article.publishedAt ? ` • ${formatPostDate(article.publishedAt)}` : ''}
          </span>
        </div>
      </Link>
    </article>
  )
}

/* ==================== THEME HOME ==================== */

export async function ThemeHome({
  tenantSlug,
  title,
  articles: passedArticles,
  settings,
  tenantDomain,
}: {
  tenantSlug: string
  title: string
  articles: Article[]
  settings?: EffectiveSettings
  tenantDomain?: string
}) {
  const lang = settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'te'
  const cssVars = themeCssVarsFromSettings(settings)
  const adPolicy = getAdsPlacementPolicy(settings)
  const logoUrl = settings?.branding?.logoUrl

  const [homepageResult, fallbackFeed] = await Promise.all([
    (tenantDomain
      ? getPublicHomepageForDomain(tenantDomain, { v: 1, themeKey: 'style1', lang })
      : getPublicHomepage({ v: 1, themeKey: 'style1', lang, shape: 'homepage' }))
      .catch(() => null),
    passedArticles.length > 0 ? Promise.resolve(passedArticles) : getHomeFeed('na').catch(() => [] as Article[]),
  ])

  const feeds = homepageResult?.feeds || {}
  const latestFromApi = feeds.latest?.items ? feedItemsToArticles(feeds.latest.items) : []
  const mostReadFromApi = feeds.mostRead?.items ? feedItemsToArticles(feeds.mostRead.items) : []
  const tickerFromApi = feeds.ticker?.items ? feedItemsToArticles(feeds.ticker.items) : []

  const dedupe = (items: Article[]): Article[] => {
    const seen = new Set<string>()
    const out: Article[] = []
    for (const a of items) {
      if (!a?.id || seen.has(a.id)) continue
      seen.add(a.id)
      out.push(a)
    }
    return out
  }

  const allArticles = dedupe([...latestFromApi, ...fallbackFeed])
  if (allArticles.length === 0) {
    return (
      <div className="theme-style3" style={cssVars}>
        <Navbar tenantSlug={tenantSlug} title={title} logoUrl={logoUrl} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <TechnicalIssues title="Technical Issues" message="వార్తలు లోడ్ కావడం లేదు. దయచేసి కొద్ది సేపటి తర్వాత ప్రయత్నించండి." />
        </div>
        <Footer settings={settings} tenantSlug={tenantSlug} />
      </div>
    )
  }

  const featured = allArticles[0]
  const trending = mostReadFromApi.length >= 3 ? mostReadFromApi.slice(0, 4) : allArticles.slice(1, 5)
  const gridNews = allArticles.slice(5, 14)
  const tickerItems = tickerFromApi.length > 0 ? tickerFromApi : allArticles.slice(0, 8)

  return (
    <div className="theme-style3 bg-slate-50 min-h-screen text-slate-900 antialiased pb-20 sm:pb-0" style={cssVars}>
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={logoUrl} />

      {tickerItems.length > 0 ? (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <FlashTicker tenantSlug={tenantSlug} items={tickerItems.slice(0, 10)} />
          </div>
        </div>
      ) : null}

      {adPolicy.home.showTopBanner && resolveProvider(getAdsSettings(settings ?? undefined), 'home_top_banner') !== 'none' ? (
        <div className="max-w-7xl mx-auto px-4 my-4 sm:my-6">
          <AdLabel />
          <div className="flex justify-center overflow-hidden rounded-lg">
            <AdSlot slot="home_top_banner" settings={settings} className="w-full max-w-[728px]" style={{ minHeight: '90px', display: 'block' }} />
          </div>
        </div>
      ) : null}

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Hero: 4-column premium grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured ? <FeaturedHero tenantSlug={tenantSlug} article={featured} /> : null}

          <TrendingPanel
            tenantSlug={tenantSlug}
            items={trending}
            settings={settings}
            showInlineAd={adPolicy.home.showRightRail2}
          />

          {adPolicy.home.showRightRail1 ? (
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <AdLabel />
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm min-h-[550px]">
                  <AdSlot slot="home_right_1" settings={settings} className="w-full h-full" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Mid in-feed ad */}
        {resolveProvider(getAdsSettings(settings ?? undefined), 'home_horizontal_1') !== 'none' ? (
          <div className="my-8 overflow-hidden">
            <AdLabel />
            <AdSlot slot="home_horizontal_1" settings={settings} className="w-full" style={{ minHeight: '90px', display: 'block' }} />
          </div>
        ) : null}

        {/* Lower grid: latest updates */}
        {gridNews.length > 0 ? (
          <section className="my-10 sm:my-12" aria-labelledby="s3-latest-heading">
            <h2 id="s3-latest-heading" className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-7 bg-[hsl(var(--primary))] rounded-sm" aria-hidden />
              తాజా అప్‌డేట్స్
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridNews.map((item) => (
                <GridCard key={item.id} tenantSlug={tenantSlug} article={item} />
              ))}
            </div>
          </section>
        ) : null}

        {adPolicy.home.multiplexMax > 0 && resolveProvider(getAdsSettings(settings ?? undefined), 'home_multiplex') !== 'none' ? (
          <div className="my-8">
            <AdLabel />
            <AdSlot slot="home_multiplex" settings={settings} className="w-full" style={{ minHeight: '280px', display: 'block' }} />
          </div>
        ) : null}
      </main>

      {adPolicy.home.showBottomBanner && resolveProvider(getAdsSettings(settings ?? undefined), 'home_bottom_banner') !== 'none' ? (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <AdLabel />
          <AdSlot slot="home_bottom_banner" settings={settings} className="w-full" style={{ minHeight: '90px', display: 'block' }} />
        </div>
      ) : null}

      <Footer settings={settings} tenantSlug={tenantSlug} />
      <MobileBottomNav tenantSlug={tenantSlug} />
    </div>
  )
}

/* ==================== ARTICLE BODY ==================== */

function S3ArticleBody({
  article,
  html,
  settings,
}: {
  article: Article
  html: string
  settings?: EffectiveSettings
}) {
  const bodyHtml = html?.trim() || resolveArticleBodyHtml(article)
  const adPolicy = getAdsPlacementPolicy(settings)

  if (!bodyHtml) {
    const fallback = article.plainText?.trim() || article.excerpt?.trim()
    return (
      <div className="s3-article-body prose prose-lg max-w-none">
        {fallback ? <p>{fallback}</p> : <p className="text-slate-500 text-center py-8">ఈ వార్త కోసం విషయం త్వరలో అందుబాటులోకి వస్తుంది.</p>}
      </div>
    )
  }

  if (!/<\s*\/\s*p\s*>/i.test(bodyHtml)) {
    return (
      <div className="s3-article-body prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    )
  }

  const parts = bodyHtml.split(/<\/p>/i)
  const nodes: ReactNode[] = []
  let paraCount = 0

  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i].trim()
    if (!chunk) continue
    const closed = chunk.endsWith('</p>') ? chunk : `${chunk}</p>`
    nodes.push(
      <div key={`p-${i}`} className="s3-paragraph" dangerouslySetInnerHTML={{ __html: closed }} />,
    )
    paraCount += 1

    if (adPolicy.article.showBottomInline && paraCount === 3 && i < parts.length - 1) {
      nodes.push(
        <div key={`ad-${i}`} className="my-6">
          <AdLabel />
          <AdSlot slot="article_inline" settings={settings} className="w-full" />
        </div>,
      )
    }
  }

  return <div className="s3-article-body prose prose-lg max-w-none">{nodes}</div>
}

/* ==================== THEME ARTICLE ==================== */

export async function ThemeArticle({
  tenantSlug,
  title,
  article,
  tenantDomain,
}: {
  tenantSlug: string
  title: string
  article: Article
  tenantDomain?: string
}) {
  const settings = await getEffectiveSettings().catch(() => undefined)
  const cssVars = themeCssVarsFromSettings(settings)
  const adPolicy = getAdsPlacementPolicy(settings)
  const logoUrl = settings?.branding?.logoUrl

  const articleSlug = article.slug || article.id || ''
  const categorySlug = getCategorySlugFromArticle(article)
  const categoryName = pickCategoryName(article)

  const articleInsightsShown = Boolean(article.excerpt?.trim()) || Boolean(article.highlights?.length)
  const articleBodyHtml =
    resolveArticleBodyHtml(article, {
      skipExcerptFallback: articleInsightsShown,
      skipHighlightsFallback: articleInsightsShown,
    }) || resolveArticleBodyHtml(article)

  const articleUrl = `https://${tenantDomain || 'kaburlutoday.com'}${articleHrefFromArticle(tenantSlug, article)}`

  const [relatedArticles, trendingSidebar] = await Promise.all([
    article.related && article.related.length > 0
      ? Promise.resolve(
          article.related
            .filter((r) => r.title && (r.slug || r.id))
            .map((r) => ({ ...r, title: r.title || '' } as Article)),
        )
      : getRelatedArticles(articleSlug, 6).catch(() => []),
    getTrendingArticles(4, articleSlug).catch(() => []),
  ])

  const related = relatedArticles.filter((a) => a.id !== article.id).slice(0, 6)

  return (
      <div className="theme-style3 bg-slate-50 min-h-screen pb-20 sm:pb-0" style={cssVars}>
      <ReadingProgress />

      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={logoUrl} collapseOnScroll={false} />

      {adPolicy.article.showTopHorizontal && resolveProvider(getAdsSettings(settings ?? undefined), 'article_horizontal') !== 'none' ? (
        <div className="max-w-7xl mx-auto px-4 my-4">
          <AdLabel />
          <AdSlot slot="article_horizontal" settings={settings} className="w-full" style={{ minHeight: '90px', display: 'block' }} />
        </div>
      ) : null}

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
              <Link href={homeHref(tenantSlug)} className="hover:text-[hsl(var(--primary))]">హోమ్</Link>
              <span aria-hidden>›</span>
              {categorySlug ? (
                <>
                  <Link href={categoryHref(tenantSlug, categorySlug)} className="hover:text-[hsl(var(--primary))]">{categoryName}</Link>
                  <span aria-hidden>›</span>
                </>
              ) : null}
              <span className="max-w-xs truncate font-medium text-slate-800">{article.title}</span>
            </nav>

            <header className="mb-6 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
              <span className="s3-badge inline-block mb-3">{categoryName}</span>
              <h1 className="s3-article-title text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-slate-900 mb-4">
                {article.title}
              </h1>
              <ArticleMetaLine publishedAt={article.publishedAt} viewCount={article.viewCount} className="text-sm mb-4" />
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 border-t border-slate-100 pt-4">
                <span>{pickAuthor(article)}</span>
                {article.readingTimeMin ? <span>{article.readingTimeMin} min read</span> : null}
              </div>
              <div className="mt-4 overflow-x-auto">
                <ShareButtons url={articleUrl} title={article.title} />
              </div>
            </header>

            {(article.excerpt || article.highlights?.length) ? (
              <div className="mb-6">
                <AeoContentBlocks
                  article={article}
                  lang="te"
                  variant="compact"
                  sections={[
                    ...(article.excerpt ? (['tldr'] as const) : []),
                    ...(article.highlights?.length ? (['facts'] as const) : []),
                  ]}
                />
              </div>
            ) : null}

            {coverUrl(article) ? (
              <figure className="mb-6 overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                <CoverImage article={article} className="w-full h-auto max-h-[75vh] object-contain mx-auto" priority />
              </figure>
            ) : null}

            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm">
              <S3ArticleBody article={article} html={articleBodyHtml} settings={settings} />

              {article.tags && article.tags.length > 0 ? (
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-8">
              <ArticleEngagementClient articleId={article.id || articleSlug} />
            </div>

            {related.length > 0 ? (
              <section className="mt-10 pt-8 border-t border-slate-200" aria-labelledby="s3-related">
                <h2 id="s3-related" className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[hsl(var(--primary))] rounded-sm" aria-hidden />
                  సంబంధిత వార్తలు
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((item) => (
                    <GridCard key={item.id || item.slug} tenantSlug={tenantSlug} article={item} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="space-y-6">
            {trendingSidebar.length > 0 ? (
              <TrendingPanel tenantSlug={tenantSlug} items={trendingSidebar} settings={settings} showInlineAd={false} />
            ) : null}

            {adPolicy.article.sidebarMax >= 1 && adPolicy.article.showSidebarTop ? (
              <div className="hidden lg:block sticky top-24 space-y-4">
                <AdLabel />
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 min-h-[250px]">
                  <AdSlot slot="article_sidebar_top" settings={settings} className="w-full" />
                </div>
                {adPolicy.article.sidebarMax >= 2 && adPolicy.article.showSidebarBottom ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 min-h-[600px]">
                    <AdSlot slot="article_sidebar_bottom" settings={settings} className="w-full" />
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>

        {adPolicy.article.showMultiplexHorizontal ? (
          <div className="mt-10">
            <AdLabel />
            <AdSlot slot="article_multiplex_h" settings={settings} className="w-full" style={{ minHeight: '280px', display: 'block' }} />
          </div>
        ) : null}
      </main>

      <Footer settings={settings} tenantSlug={tenantSlug} />
      <MobileBottomNav tenantSlug={tenantSlug} />
    </div>
  )
}

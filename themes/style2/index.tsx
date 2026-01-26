import { Footer, TechnicalIssues } from '@/components/shared'
import { Navbar } from '@/components/shared/Navbar'
import { TopArticlesModal } from '@/components/shared/TopArticlesModal'
import { FlashTicker } from '@/components/shared/FlashTicker'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import MobileBottomNav from '@/components/shared/MobileBottomNav'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import Link from 'next/link'
import type { UrlObject } from 'url'
import { articleHref, categoryHref } from '@/lib/url'
import { getTenantFromHeaders } from '@/lib/tenant'
import { getArticlesByCategory, getHomeFeed } from '@/lib/data'
import { getPublicHomepage, getPublicHomepageStyle2ShapeForDomain, getPublicHomepageStyle2Shape, type Style2HomepageItem, type Style2HomepageResponse, type NewHomepageResponse, feedItemsToArticles } from '@/lib/homepage'
import { getCategoriesForNav, type Category } from '@/lib/categories'
import { getEffectiveSettings } from '@/lib/settings'
import { themeCssVarsFromSettings } from '@/lib/theme-vars'
import { getDomainStats } from '@/lib/domain-stats'

/* ==================== UTILITY FUNCTIONS ==================== */

function style2ItemToArticle(item: Style2HomepageItem): Article {
  // Check all possible image fields: image, coverImageUrl, coverImage
  const coverUrl = item.image || item.coverImageUrl || item.coverImage || undefined
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    excerpt: item.excerpt || undefined,
    publishedAt: item.publishedAt || undefined,
    coverImage: coverUrl ? { url: coverUrl } : undefined,
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

/* ==================== TOI-STYLE HERO FEATURE ==================== */

function HeroFeature({ tenantSlug, article }: { tenantSlug: string; article: Article }) {
  return (
    <article className="group bg-white overflow-hidden">
      <Link href={toHref(articleHref(tenantSlug, article.slug || article.id))} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
          {article.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={article.coverImage.url} 
              alt={article.title} 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <PlaceholderImg className="absolute inset-0 h-full w-full object-cover" />
          )}
          {/* Breaking badge */}
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold uppercase tracking-wider bg-[hsl(var(--primary))] text-white">
            బ్రేకింగ్
          </span>
        </div>
        
        {/* Text below image - BLACK text */}
        <div className="p-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black leading-tight line-clamp-3 group-hover:text-[hsl(var(--primary))] transition-colors">
            {article.title}
          </h1>
          {article.excerpt ? (
            <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{article.excerpt}</p>
          ) : null}
          {article.publishedAt ? (
            <time className="mt-2 block text-xs text-zinc-500">
              {new Date(String(article.publishedAt)).toLocaleDateString('te-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

/* ==================== TOI-STYLE SECONDARY CARDS ==================== */

function SecondaryCard({ tenantSlug, article }: { tenantSlug: string; article: Article }) {
  return (
    <article className="group bg-white border-b border-zinc-100 pb-3 last:border-b-0">
      <Link href={toHref(articleHref(tenantSlug, article.slug || article.id))} className="flex gap-3">
        <div className="h-16 w-24 shrink-0 overflow-hidden bg-zinc-100">
          {article.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.coverImage.url} alt={article.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <PlaceholderImg className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-black line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
            {article.title}
          </h3>
          {article.publishedAt ? (
            <time className="mt-1 text-xs text-zinc-500">
              {new Date(String(article.publishedAt)).toLocaleDateString('te-IN', { month: 'short', day: 'numeric' })}
            </time>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

/* ==================== TOI-STYLE WIDGETS ==================== */

function TrendingWidget({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  if (!items.length) return null
  
  return (
    <div className="bg-white border border-zinc-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>🔥</span>
          ట్రెండింగ్ వార్తలు
        </h3>
      </div>
      <div className="divide-y divide-zinc-100">
        {items.slice(0, 5).map((a, idx) => (
          <Link
            key={a.id}
            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
            className="group flex items-start gap-3 p-3 hover:bg-zinc-50 transition-colors"
          >
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-500 text-xs font-bold text-white rounded">
              {idx + 1}
            </span>
            <span className="text-sm font-medium text-black line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
              {a.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function LatestNewsWidget({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  if (!items.length) return null
  
  return (
    <div className="bg-white border border-zinc-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>📰</span>
          తాజా వార్తలు
        </h3>
      </div>
      <div className="divide-y divide-zinc-100">
        {items.slice(0, 6).map((a) => (
          <Link
            key={a.id}
            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
            className="group block p-3 hover:bg-zinc-50 transition-colors"
          >
            <span className="text-sm font-medium text-black line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
              {a.title}
            </span>
            {a.publishedAt ? (
              <time className="mt-1 block text-xs text-zinc-500">
                {new Date(String(a.publishedAt)).toLocaleDateString('te-IN', { hour: '2-digit', minute: '2-digit' })}
              </time>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ==================== ATTRACTIVE AD BANNERS ==================== */

function AdBanner({ 
  variant = 'horizontal',
  size = 'medium'
}: { 
  variant?: 'horizontal' | 'sidebar' | 'leaderboard'
  size?: 'small' | 'medium' | 'large'
}) {
  const heights = {
    small: 100,
    medium: 160,
    large: 280
  }
  
  // Bright colorful gradient backgrounds
  const gradientStyles = {
    horizontal: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
    sidebar: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600',
    leaderboard: 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500'
  }
  
  return (
    <div 
      className={`relative overflow-hidden rounded-xl ${gradientStyles[variant]} shadow-lg`}
      style={{ minHeight: `${heights[size]}px` }}
    >
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      
      <div className="relative h-full w-full flex flex-col items-center justify-center text-center p-5">
        <div className="absolute top-2 right-3 px-2 py-0.5 bg-white/20 rounded text-[10px] uppercase tracking-wider text-white font-medium">
          ప్రకటన
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur flex items-center justify-center shadow-lg">
            <span className="text-2xl">📢</span>
          </div>
          <div className="text-left">
            <span className="text-xl font-bold text-white drop-shadow-md">మీ బ్రాండ్ ఇక్కడ</span>
            <p className="text-sm text-white/90">లక్షలాది రీడర్లకు చేరుకోండి</p>
          </div>
        </div>
        
        <a 
          href="mailto:ads@kaburlumedia.com?subject=Advertisement Inquiry" 
          className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          ప్రకటనల కోసం సంప్రదించండి
        </a>
      </div>
    </div>
  )
}

/* ==================== SECTION COMPONENTS ==================== */

function SectionCard({ 
  title, 
  href, 
  children 
}: { 
  title: string
  href?: string
  children: React.ReactNode 
}) {
  if (!children) return null
  
  return (
    <section className="bg-white border-b border-zinc-200 pb-4">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {href ? (
          <Link href={toHref(href)} className="section-link">
            మరిన్ని చూడండి →
          </Link>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  )
}

/* ==================== ARTICLE CARD COMPONENTS ==================== */

function TitleList({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  if (!items.length) return null
  
  return (
    <div className="title-list">
      {items.map((a, idx) => (
        <Link
          key={a.id}
          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
          className="title-list-item group"
        >
          <span className="number">{idx + 1}</span>
          <span className="text-sm font-medium leading-snug text-black group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
            {a.title}
          </span>
        </Link>
      ))}
    </div>
  )
}

function SmallCardList({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  if (!items.length) return null
  
  return (
    <div className="small-card-list">
      {items.map((a) => (
        <article key={a.id} className="group flex gap-3 py-2.5 border-b border-zinc-100 last:border-b-0">
          <div className="h-14 w-20 shrink-0 overflow-hidden bg-zinc-100">
            {a.coverImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
            ) : (
              <PlaceholderImg className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex flex-col justify-center flex-1">
            <Link
              href={toHref(articleHref(tenantSlug, a.slug || a.id))}
              className="line-clamp-2 text-sm font-medium text-black group-hover:text-[hsl(var(--primary))] transition-colors"
            >
              {a.title}
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}

/* ==================== STYLE 2: MAGAZINE GRID SECTION ==================== */

function MagazineGridSection({ 
  tenantSlug, 
  title, 
  href, 
  items,
  accentColor = 'from-emerald-500 to-teal-600'
}: { 
  tenantSlug: string
  title: string
  href?: string
  items: Article[]
  accentColor?: string
}) {
  if (!items.length) return null
  
  const mainArticle = items[0]
  const sideArticles = items.slice(1, 4)
  
  return (
    <section className="py-8">
      <div className={`flex items-center gap-3 mb-6`}>
        <div className={`w-1.5 h-8 rounded-full bg-gradient-to-b ${accentColor}`} />
        <h2 className="text-xl font-bold text-black">{title}</h2>
        {href ? (
          <Link href={toHref(href)} className="ml-auto text-sm font-medium text-zinc-500 hover:text-black transition-colors">
            మరిన్ని చూడండి →
          </Link>
        ) : null}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Main large article */}
        {mainArticle ? (
          <Link href={toHref(articleHref(tenantSlug, mainArticle.slug || mainArticle.id))} className="group relative overflow-hidden rounded-xl bg-black">
            <div className="aspect-[16/10] w-full">
              {mainArticle.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainArticle.coverImage.url} alt={mainArticle.title} className="h-full w-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
              ) : (
                <PlaceholderImg className="h-full w-full object-cover opacity-70" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className={`inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider rounded-full bg-gradient-to-r ${accentColor} text-white`}>
                {title}
              </span>
              <h3 className="text-xl lg:text-2xl font-bold text-white line-clamp-3 group-hover:text-emerald-300 transition-colors">
                {mainArticle.title}
              </h3>
              {mainArticle.excerpt ? (
                <p className="mt-2 text-sm text-white/70 line-clamp-2">{mainArticle.excerpt}</p>
              ) : null}
            </div>
          </Link>
        ) : null}
        
        {/* Side articles stack */}
        <div className="space-y-4">
          {sideArticles.map((a) => (
            <Link 
              key={a.id}
              href={toHref(articleHref(tenantSlug, a.slug || a.id))}
              className="group flex gap-4 p-3 rounded-lg bg-white border border-zinc-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {a.coverImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <PlaceholderImg className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-sm font-bold text-black line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {a.title}
                </h4>
                {a.publishedAt ? (
                  <time className="mt-1 text-xs text-zinc-400">
                    {new Date(String(a.publishedAt)).toLocaleDateString('te-IN', { month: 'short', day: 'numeric' })}
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

/* ==================== STYLE 3: HORIZONTAL SCROLL CARDS ==================== */

function HorizontalCardsSection({ 
  tenantSlug, 
  title, 
  href, 
  items,
  accentColor = 'from-rose-500 to-pink-600'
}: { 
  tenantSlug: string
  title: string
  href?: string
  items: Article[]
  accentColor?: string
}) {
  if (!items.length) return null
  
  return (
    <section className="py-8 -mx-4 px-4 bg-gradient-to-r from-zinc-50 to-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center`}>
            <span className="text-white text-lg">📰</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">{title}</h2>
            <p className="text-xs text-zinc-500">తాజా అప్‌డేట్‌లు</p>
          </div>
          {href ? (
            <Link href={toHref(href)} className="ml-auto px-4 py-2 rounded-full bg-white border border-zinc-200 text-sm font-medium text-zinc-600 hover:border-rose-300 hover:text-rose-600 transition-all">
              అన్నీ చూడండి
            </Link>
          ) : null}
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {items.slice(0, 6).map((a, idx) => (
            <Link 
              key={a.id}
              href={toHref(articleHref(tenantSlug, a.slug || a.id))}
              className="group flex-shrink-0 w-72 snap-start"
            >
              <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  {a.coverImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <PlaceholderImg className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-md bg-gradient-to-r ${accentColor} text-white text-xs font-bold`}>
                    {idx + 1}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-black line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {a.title}
                  </h3>
                  {a.publishedAt ? (
                    <time className="mt-2 block text-xs text-zinc-400">
                      {new Date(String(a.publishedAt)).toLocaleDateString('te-IN', { month: 'long', day: 'numeric' })}
                    </time>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ==================== STYLE 4: SPOTLIGHT SECTION ==================== */

function SpotlightSection({ 
  tenantSlug, 
  title, 
  href, 
  items,
  accentColor = 'from-amber-500 to-orange-600'
}: { 
  tenantSlug: string
  title: string
  href?: string
  items: Article[]
  accentColor?: string
}) {
  if (!items.length) return null
  
  return (
    <section className={`py-8 -mx-4 px-4 bg-gradient-to-br ${accentColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          {href ? (
            <Link href={toHref(href)} className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm font-medium text-white hover:bg-white/30 transition-colors">
              మరిన్ని →
            </Link>
          ) : null}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.slice(0, 4).map((a) => (
            <Link 
              key={a.id}
              href={toHref(articleHref(tenantSlug, a.slug || a.id))}
              className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden">
                {a.coverImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform" />
                ) : (
                  <PlaceholderImg className="h-full w-full object-cover opacity-90" />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-yellow-200 transition-colors">
                  {a.title}
                </h3>
                {a.publishedAt ? (
                  <time className="mt-2 block text-xs text-white/60">
                    {new Date(String(a.publishedAt)).toLocaleDateString('te-IN', { month: 'short', day: 'numeric' })}
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

/* ==================== STYLE 5: NEWSPAPER COLUMNS ==================== */

function NewspaperColumnsSection({ 
  tenantSlug, 
  title, 
  href, 
  items,
  accentColor = 'border-blue-600'
}: { 
  tenantSlug: string
  title: string
  href?: string
  items: Article[]
  accentColor?: string
}) {
  if (!items.length) return null
  
  const col1 = items.slice(0, 3)
  const col2 = items.slice(3, 6)
  
  return (
    <section className="py-8 bg-white">
      <div className={`border-t-4 ${accentColor} pt-4`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-black uppercase tracking-wide">{title}</h2>
          {href ? (
            <Link href={toHref(href)} className="text-sm font-medium text-blue-600 hover:underline">
              మరిన్ని చదవండి →
            </Link>
          ) : null}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-x divide-zinc-200">
          {/* Column 1 */}
          <div className="space-y-6">
            {col1.map((a, idx) => (
              <Link 
                key={a.id}
                href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                className={`group block ${idx > 0 ? 'pt-6 border-t border-zinc-100' : ''}`}
              >
                {idx === 0 && a.coverImage?.url ? (
                  <div className="aspect-[16/9] mb-4 overflow-hidden bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                ) : null}
                <h3 className={`font-serif font-bold text-black group-hover:text-blue-600 transition-colors ${idx === 0 ? 'text-xl' : 'text-base'}`}>
                  {a.title}
                </h3>
                {a.excerpt && idx === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600 line-clamp-2 leading-relaxed">{a.excerpt}</p>
                ) : null}
                {a.publishedAt ? (
                  <time className="mt-2 block text-xs text-zinc-400 uppercase tracking-wider">
                    {new Date(String(a.publishedAt)).toLocaleDateString('te-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </time>
                ) : null}
              </Link>
            ))}
          </div>
          
          {/* Column 2 */}
          <div className="space-y-6 pl-8">
            {col2.map((a, idx) => (
              <Link 
                key={a.id}
                href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                className={`group block ${idx > 0 ? 'pt-6 border-t border-zinc-100' : ''}`}
              >
                <h3 className="font-serif font-bold text-black group-hover:text-blue-600 transition-colors">
                  {a.title}
                </h3>
                {a.publishedAt ? (
                  <time className="mt-1 block text-xs text-zinc-400">
                    {new Date(String(a.publishedAt)).toLocaleDateString('te-IN', { month: 'short', day: 'numeric' })}
                  </time>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ==================== STYLE 6: PHOTO GALLERY GRID ==================== */

function PhotoGallerySection({ 
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
  if (!items.length) return null
  
  return (
    <section className="py-8 bg-zinc-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📷</span>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        {href ? (
          <Link href={toHref(href)} className="px-4 py-2 rounded-full border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
            మరిన్ని →
          </Link>
        ) : null}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {items.slice(0, 6).map((a, idx) => (
          <Link 
            key={a.id}
            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
            className={`group relative overflow-hidden ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}
          >
            <div className={`${idx === 0 ? 'aspect-square' : 'aspect-[4/3]'} w-full`}>
              {a.coverImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <PlaceholderImg className="h-full w-full object-cover" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
              <h3 className="text-sm font-bold text-white line-clamp-2">{a.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ==================== STYLE 7: TIMELINE SECTION ==================== */

function TimelineSection({ 
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
  if (!items.length) return null
  
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-lg">🕐</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">{title}</h2>
            <p className="text-xs text-zinc-500">టైమ్‌లైన్</p>
          </div>
        </div>
        {href ? (
          <Link href={toHref(href)} className="text-sm font-medium text-indigo-600 hover:underline">
            అన్నీ చూడండి →
          </Link>
        ) : null}
      </div>
      
      <div className="relative pl-8 border-l-2 border-indigo-200 space-y-6">
        {items.slice(0, 5).map((a) => (
          <Link 
            key={a.id}
            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
            className="group block relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow group-hover:scale-125 transition-transform" />
            
            <div className="flex gap-4 p-4 rounded-lg bg-white border border-zinc-100 hover:border-indigo-200 hover:shadow-lg transition-all">
              {a.coverImage?.url ? (
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="flex-1 min-w-0">
                {a.publishedAt ? (
                  <time className="text-xs font-medium text-indigo-600">
                    {new Date(String(a.publishedAt)).toLocaleDateString('te-IN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </time>
                ) : null}
                <h3 className="mt-1 text-sm font-bold text-black line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {a.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ==================== STYLE 8: FEATURED BANNER SECTION ==================== */

function FeaturedBannerSection({ 
  tenantSlug, 
  title, 
  items
}: { 
  tenantSlug: string
  title: string
  items: Article[]
}) {
  if (!items.length) return null
  
  const featured = items[0]
  
  return (
    <section className="py-8 -mx-4 px-4">
      <Link 
        href={toHref(articleHref(tenantSlug, featured.slug || featured.id))}
        className="group block relative overflow-hidden rounded-2xl"
      >
        <div className="aspect-[21/9] w-full">
          {featured.coverImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featured.coverImage.url} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <PlaceholderImg className="h-full w-full object-cover" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-xl p-8">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider rounded-full bg-red-600 text-white">
              {title}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight group-hover:text-red-300 transition-colors">
              {featured.title}
            </h2>
            {featured.excerpt ? (
              <p className="mt-3 text-base text-white/80 line-clamp-2">{featured.excerpt}</p>
            ) : null}
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
              <span>చదవండి</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}

/* ==================== STYLE 9: COMPACT LIST SECTION ==================== */

function CompactListSection({ 
  tenantSlug, 
  title, 
  href, 
  items,
  accentColor = 'bg-green-600'
}: { 
  tenantSlug: string
  title: string
  href?: string
  items: Article[]
  accentColor?: string
}) {
  if (!items.length) return null
  
  return (
    <section className="py-6 bg-zinc-50 rounded-xl">
      <div className="flex items-center gap-3 px-4 mb-4">
        <div className={`w-2 h-8 rounded-full ${accentColor}`} />
        <h2 className="text-lg font-bold text-black">{title}</h2>
        {href ? (
          <Link href={toHref(href)} className="ml-auto text-xs font-medium text-zinc-500 hover:text-black">
            మరిన్ని →
          </Link>
        ) : null}
      </div>
      
      <div className="divide-y divide-zinc-200">
        {items.slice(0, 8).map((a, idx) => (
          <Link 
            key={a.id}
            href={toHref(articleHref(tenantSlug, a.slug || a.id))}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors"
          >
            <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-white ${accentColor}`}>
              {idx + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-black line-clamp-1 group-hover:text-green-600 transition-colors">
              {a.title}
            </span>
            {a.publishedAt ? (
              <time className="text-xs text-zinc-400 shrink-0">
                {new Date(String(a.publishedAt)).toLocaleDateString('te-IN', { hour: '2-digit', minute: '2-digit' })}
              </time>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ==================== MAIN THEME HOME COMPONENT ==================== */

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
  // Style2 fetches its own data internally via getPublicHomepage API
  // The articles prop is ignored - we always fetch fresh data

  // Extract domain from settings for API calls
  const canonicalBaseUrl = settings?.seo?.canonicalBaseUrl || settings?.settings?.seo?.canonicalBaseUrl
  const siteUrl = canonicalBaseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const domain = tenantDomain || siteUrl.replace(/^https?:\/\//, '').split('/')[0]

  // Use smart API integration for style2 with v=2 and shape=style2
  const themeKey = settings?.theme?.theme || settings?.theme?.key || 'style2'
  const lang = settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'te'
  
  let homepage: NewHomepageResponse | null = null
  try {
    homepage = await getPublicHomepage({ v: 2, themeKey, lang, shape: 'style2' })
  } catch {
    homepage = null
  }

  // Extract feeds from the new API structure
  const feeds = homepage?.feeds || {}

  // Smart section data extraction using feeds
  const latestItems = feeds.latest?.items ? feedItemsToArticles(feeds.latest.items) : []
  const mostReadItems = feeds.mostRead?.items ? feedItemsToArticles(feeds.mostRead.items).slice(0, 5) : []
  const tickerItems = feeds.ticker?.items ? feedItemsToArticles(feeds.ticker.items) : []

  let navCats: Category[] = []
  
  try {
    navCats = await getCategoriesForNav()
  } catch {
    // Navigation failed - continue with empty categories
  }
  
  const topNavCats = navCats.filter((c) => !c.parentId)

  // Fallback to old API if new one doesn't return data
  const style2Home = (!latestItems.length && !mostReadItems.length) 
    ? await (tenantDomain
        ? getPublicHomepageStyle2ShapeForDomain(tenantDomain)
        : getPublicHomepageStyle2Shape()
      ).catch(() => null)
    : null
  
  const byCategorySlug = buildStyle2CategoryMap(style2Home)
  const style2Feed = buildStyle2HomeFeed(style2Home)
  const style2Hero = Array.isArray(style2Home?.hero) ? style2Home!.hero!.map(style2ItemToArticle) : []

  // Use smart API data with fallbacks
  // Generate mock data if all API sources are empty (for development/testing)
  const mockArticles = (latestItems.length === 0 && style2Feed.length === 0 && articles.length === 0)
    ? await import('@/lib/data').then(m => m.getHomeFeed('mock')).catch(() => [])
    : []
  
  const heroLeftData = latestItems.length > 0 ? latestItems : (style2Feed.length ? style2Feed : (articles.length ? articles : mockArticles))
  const heroRightMostRead = mostReadItems.length > 0 ? mostReadItems : (style2Feed.length ? style2Feed.slice(0, 5) : (articles.length ? articles.slice(0, 5) : mockArticles.slice(0, 5)))
  
  const homeFeed = latestItems.length > 0 ? latestItems : (style2Feed.length ? style2Feed : (articles.length ? articles : mockArticles))
  
  if (homeFeed.length === 0) {
    // Fetch domain stats for modal even in error case - don't block rendering
    let domainStats = null
    try {
      domainStats = await Promise.race([
        getDomainStats(domain),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)) // 2s timeout
      ])
    } catch (error) {
      console.error('Failed to fetch domain stats:', error)
      domainStats = null
    }

    return (
      <div className="theme-style2">
        <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} variant="style2" />
        <div className="bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <TechnicalIssues 
              title="కంటెంట్ అందుబాటులో లేదు"
              message="ప్రస్తుతం కంటెంట్ లోడ్ చేయడం సాధ్యం కాలేదు. దయచేసి Kaburlu Media సపోర్ట్‌ను సంప్రదించండి."
            />
          </div>
        </div>
        <Footer settings={settings} tenantSlug={tenantSlug} />
        {domainStats?.topArticles && domainStats.topArticles.length > 0 && (
          <TopArticlesModal 
            articles={domainStats.topArticles.slice(0, 5)} 
            articleHref={(slug) => articleHref(tenantSlug, slug)}
          />
        )}
      </div>
    )
  }

  const cssVars = themeCssVarsFromSettings(settings)

  async function getItemsForCategory(slug: string, count: number): Promise<Article[]> {
    const backend = byCategorySlug.get(slug)
    if (backend?.length) return backend.slice(0, count)
    try {
      const list = await getArticlesByCategory('na', slug)
      return list.slice(0, count)
    } catch {
      return []
    }
  }

  const categoryData = await Promise.all(
    topNavCats.slice(0, 6).map(async (cat, idx) => {
      const items = cat.slug 
        ? await getItemsForCategory(cat.slug, 6)
        : homeFeed.slice(idx * 6, (idx + 1) * 6)
      return {
        title: cat.name,
        href: cat.slug ? categoryHref(tenantSlug, cat.slug) : undefined,
        items,
      }
    })
  )

  // Additional categories for extra sections
  const extraCategoryData = await Promise.all(
    topNavCats.slice(6, 12).map(async (cat) => {
      const items = cat.slug 
        ? await getItemsForCategory(cat.slug, 6)
        : []
      return {
        title: cat.name,
        href: cat.slug ? categoryHref(tenantSlug, cat.slug) : undefined,
        items,
      }
    })
  )

  const heroArticle = style2Hero.length ? style2Hero[0] : heroLeftData[0]
  const secondaryArticles = heroLeftData.slice(1, 9) // 8 articles: 2 cols × 4 rows
  const latestArticles = homeFeed.slice(10, 20)

  // Fetch domain stats for modal - don't block rendering
  let domainStats = null
  try {
    domainStats = await Promise.race([
      getDomainStats(domain),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)) // 2s timeout
    ])
  } catch (error) {
    console.error('Failed to fetch domain stats:', error)
    domainStats = null
  }

  return (
    <div className="theme-style2 pb-16 sm:pb-0" style={cssVars}>
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} variant="style2" />

      <div className="flash-ticker">
        <div className="mx-auto max-w-7xl px-4">
          <FlashTicker tenantSlug={tenantSlug} items={tickerItems.length > 0 ? tickerItems.slice(0, 10) : homeFeed.slice(0, 10)} intervalMs={3500} />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* TOI-Style Hero Section with Sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
          {/* Main Content Area - Latest News (Left Side) */}
          <div className="space-y-6">
            {/* Hero Feature with Overlay */}
            {heroArticle ? <HeroFeature tenantSlug={tenantSlug} article={heroArticle} /> : null}
            
            {/* Secondary Stories Grid */}
            {secondaryArticles.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {secondaryArticles.map((a) => (
                  <SecondaryCard key={a.id} tenantSlug={tenantSlug} article={a} />
                ))}
              </div>
            ) : null}
          </div>

          {/* Sidebar with Widgets - Right Side */}
          <div className="space-y-6">
            {/* Most Read - Top of Right Side (5 items) */}
            {heroRightMostRead.length > 0 ? (
              <TrendingWidget tenantSlug={tenantSlug} items={heroRightMostRead} />
            ) : null}
            <AdBanner variant="sidebar" size="medium" />
            {/* Latest News Widget - Bottom of Right Side */}
            {latestArticles.length > 0 ? (
              <LatestNewsWidget tenantSlug={tenantSlug} items={latestArticles.slice(0, 6)} />
            ) : null}
          </div>
        </div>

        {/* Mid-page Ad Banner */}
        <div className="my-8">
          <AdBanner variant="leaderboard" size="small" />
        </div>

        {/* Category Columns Grid (TOI-Style) */}
        {categoryData.length > 0 && categoryData.some(cat => cat.items.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {categoryData.map((cat, idx) => (
              cat.items.length > 0 ? (
                <div key={idx} className="bg-white border border-zinc-200 overflow-hidden">
                  <div className="bg-[hsl(var(--primary))] px-4 py-2.5">
                    <h3 className="text-sm font-bold text-white flex items-center justify-between">
                      {cat.title}
                      {cat.href ? (
                        <Link href={toHref(cat.href)} className="text-xs text-white/70 hover:text-white transition-colors">
                          మరిన్ని →
                        </Link>
                      ) : null}
                    </h3>
                  </div>
                  <div className="p-3 divide-y divide-zinc-100">
                    {cat.items.slice(0, 5).map((a) => (
                      <SecondaryCard key={a.id} tenantSlug={tenantSlug} article={a} />
                    ))}
                  </div>
                </div>
              ) : null
            ))}
          </div>
        ) : null}

        {/* More Categories in Columns */}
        {topNavCats.length > 3 ? (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {topNavCats.slice(3, 6).map(async (cat) => {
              const items = cat.slug 
                ? await getItemsForCategory(cat.slug, 5)
                : []
              
              if (!items.length) return null
              
              return (
                <SectionCard 
                  key={cat.id} 
                  title={cat.name} 
                  href={cat.slug ? categoryHref(tenantSlug, cat.slug) : undefined}
                >
                  <SmallCardList tenantSlug={tenantSlug} items={items} />
                </SectionCard>
              )
            })}
          </div>
        ) : null}

        {/* ===== NEW STYLE SECTIONS ===== */}
        
        {/* Style 2: Magazine Grid Section (Emerald theme) */}
        {categoryData[0]?.items?.length > 0 ? (
          <MagazineGridSection 
            tenantSlug={tenantSlug}
            title={categoryData[0].title}
            href={categoryData[0].href}
            items={categoryData[0].items}
            accentColor="from-emerald-500 to-teal-600"
          />
        ) : null}

        {/* Ad Banner */}
        <div className="my-6">
          <AdBanner variant="horizontal" size="medium" />
        </div>

        {/* Style 3: Horizontal Scroll Cards (Rose theme) */}
        {categoryData[1]?.items?.length > 0 ? (
          <HorizontalCardsSection 
            tenantSlug={tenantSlug}
            title={categoryData[1].title}
            href={categoryData[1].href}
            items={categoryData[1].items}
            accentColor="from-rose-500 to-pink-600"
          />
        ) : null}

        {/* Style 4: Spotlight Section (Amber/Orange theme) */}
        {categoryData[2]?.items?.length > 0 || latestArticles.length > 4 ? (
          <SpotlightSection 
            tenantSlug={tenantSlug}
            title={categoryData[2]?.title || "స్పాట్‌లైట్"}
            href={categoryData[2]?.href}
            items={categoryData[2]?.items?.length > 0 ? categoryData[2].items : latestArticles.slice(0, 4)}
            accentColor="from-amber-500 to-orange-600"
          />
        ) : null}

        {/* Ad Banner */}
        <div className="my-6">
          <AdBanner variant="leaderboard" size="small" />
        </div>

        {/* Style 5: Newspaper Columns (Blue theme) */}
        {categoryData[3]?.items?.length > 0 || homeFeed.length > 20 ? (
          <NewspaperColumnsSection 
            tenantSlug={tenantSlug}
            title={categoryData[3]?.title || "వార్తా విశ్లేషణ"}
            href={categoryData[3]?.href}
            items={categoryData[3]?.items?.length > 0 ? categoryData[3].items : homeFeed.slice(20, 26)}
            accentColor="border-blue-600"
          />
        ) : null}

        {/* Extra category sections with varied styles */}
        {extraCategoryData.length > 0 ? (
          <>
            {extraCategoryData[0]?.items?.length > 0 ? (
              <MagazineGridSection 
                tenantSlug={tenantSlug}
                title={extraCategoryData[0].title}
                href={extraCategoryData[0].href}
                items={extraCategoryData[0].items}
                accentColor="from-violet-500 to-purple-600"
              />
            ) : homeFeed.length > 10 ? (
              <MagazineGridSection 
                tenantSlug={tenantSlug}
                title="వైవిధ్య వార్తలు"
                items={homeFeed.slice(0, 4)}
                accentColor="from-violet-500 to-purple-600"
              />
            ) : null}
            
            {extraCategoryData[1]?.items?.length > 0 ? (
              <HorizontalCardsSection 
                tenantSlug={tenantSlug}
                title={extraCategoryData[1].title}
                href={extraCategoryData[1].href}
                items={extraCategoryData[1].items}
                accentColor="from-cyan-500 to-blue-600"
              />
            ) : homeFeed.length > 6 ? (
              <HorizontalCardsSection 
                tenantSlug={tenantSlug}
                title="ట్రెండింగ్ స్టోరీస్"
                items={homeFeed.slice(4, 10)}
                accentColor="from-cyan-500 to-blue-600"
              />
            ) : null}
          </>
        ) : homeFeed.length > 10 ? (
          <>
            <MagazineGridSection 
              tenantSlug={tenantSlug}
              title="వైవిధ్య వార్తలు"
              items={homeFeed.slice(0, 4)}
              accentColor="from-violet-500 to-purple-600"
            />
            <HorizontalCardsSection 
              tenantSlug={tenantSlug}
              title="ట్రెండింగ్ స్టోరీస్"
              items={homeFeed.slice(4, 10)}
              accentColor="from-cyan-500 to-blue-600"
            />
          </>
        ) : null}

        {/* Ad Banner */}
        <div className="my-6">
          <AdBanner variant="sidebar" size="medium" />
        </div>

        {/* Style 6: Photo Gallery Section - Always show with available data */}
        {homeFeed.length > 4 ? (
          <PhotoGallerySection 
            tenantSlug={tenantSlug}
            title={categoryData[4]?.title || "ఫోటో గ్యాలరీ"}
            href={categoryData[4]?.href}
            items={categoryData[4]?.items?.length > 0 ? categoryData[4].items : homeFeed.slice(0, 6)}
          />
        ) : null}

        {/* Ad Banner */}
        <div className="my-6">
          <AdBanner variant="leaderboard" size="small" />
        </div>

        {/* Style 7: Timeline Section - Always show with available data */}
        {homeFeed.length > 3 ? (
          <TimelineSection 
            tenantSlug={tenantSlug}
            title={categoryData[5]?.title || "తాజా అప్‌డేట్స్"}
            href={categoryData[5]?.href}
            items={categoryData[5]?.items?.length > 0 ? categoryData[5].items : homeFeed.slice(2, 7)}
          />
        ) : null}

        {/* Style 8: Featured Banner - Always show with first article */}
        {homeFeed.length > 0 ? (
          <FeaturedBannerSection 
            tenantSlug={tenantSlug}
            title="ప్రత్యేక వార్త"
            items={[homeFeed[Math.floor(homeFeed.length / 2)] || homeFeed[0]]}
          />
        ) : null}

        {/* Ad Banner */}
        <div className="my-6">
          <AdBanner variant="horizontal" size="medium" />
        </div>

        {/* Style 9: Two Compact Lists Side by Side - Always show */}
        {homeFeed.length > 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompactListSection 
              tenantSlug={tenantSlug}
              title={extraCategoryData[2]?.title || "ఇతర వార్తలు"}
              href={extraCategoryData[2]?.href}
              items={extraCategoryData[2]?.items?.length > 0 ? extraCategoryData[2].items : homeFeed.slice(0, 8)}
              accentColor="bg-green-600"
            />
            
            <CompactListSection 
              tenantSlug={tenantSlug}
              title={extraCategoryData[3]?.title || "మరిన్ని వార్తలు"}
              href={extraCategoryData[3]?.href}
              items={extraCategoryData[3]?.items?.length > 0 ? extraCategoryData[3].items : [...homeFeed].reverse().slice(0, 8)}
              accentColor="bg-purple-600"
            />
          </div>
        ) : null}

        {/* ===== FINAL AD BANNERS SECTION ===== */}
        <div className="mt-10 space-y-6">
          {/* Large Premium Ad Banner */}
          <AdBanner variant="leaderboard" size="large" />
          
          {/* Three Ad Banners in a Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdBanner variant="sidebar" size="medium" />
            <AdBanner variant="horizontal" size="medium" />
            <AdBanner variant="sidebar" size="medium" />
          </div>
          
          {/* Final Wide Banner */}
          <AdBanner variant="horizontal" size="medium" />
        </div>
      </main>

      <Footer settings={settings} tenantSlug={tenantSlug} />
      <MobileBottomNav tenantSlug={tenantSlug} />
      {domainStats?.topArticles && domainStats.topArticles.length > 0 && (
        <TopArticlesModal 
          articles={domainStats.topArticles.slice(0, 5)} 
          articleHref={(slug) => articleHref(tenantSlug, slug)}
        />
      )}
    </div>
  )
}

/* ==================== REPORTER SECTION COMPONENT ==================== */

function ReporterSection({ article }: { article: Article }) {
  const authorName = (article as { author?: { name?: string } }).author?.name || 'Kaburlu Media'
  const initials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  
  return (
    <div className="reporter-section">
      <h4>రిపోర్టర్</h4>
      <div className="reporter-info">
        <div className="reporter-avatar">{initials}</div>
        <div className="reporter-details">
          <div className="reporter-name">{authorName}</div>
          <div className="reporter-role">Senior Correspondent</div>
        </div>
      </div>
    </div>
  )
}

/* ==================== THEME ARTICLE COMPONENT ==================== */

export async function ThemeArticle({ 
  tenantSlug, 
  title, 
  article 
}: { 
  tenantSlug: string
  title: string
  article: Article 
}) {
  const settings = await getEffectiveSettings().catch(() => undefined)
  const cssVars = themeCssVarsFromSettings(settings)
  const tenant = await getTenantFromHeaders()
  
  let sidebarLatest: Article[] = []
  try {
    const sidebarFeed = await getHomeFeed(tenant.id)
    sidebarLatest = sidebarFeed.filter((a) => a.id !== article.id).slice(0, 8)
  } catch {
    // Sidebar failed - continue without it
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    ...(article.coverImage?.url ? { image: [article.coverImage.url] } : {}),
    datePublished: article.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: title,
    },
    publisher: {
      '@type': 'Organization',
      name: title,
      ...(settings?.branding?.logoUrl ? { logo: { '@type': 'ImageObject', url: settings.branding.logoUrl } } : {}),
    },
  }

  return (
    <div className="theme-style2 pb-16 sm:pb-0" style={cssVars}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} variant="style2" />
      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
              <Link href={`/t/${tenantSlug}`} className="hover:text-[hsl(var(--primary))] transition-colors">హోమ్</Link>
              <span>›</span>
              <span className="text-zinc-700">వార్త</span>
            </nav>
            
            <header className="mb-6">
              <h1 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-black">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                {article.publishedAt ? (
                  <time className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(String(article.publishedAt)).toLocaleDateString('te-IN', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                ) : null}
              </div>
            </header>

            {article.coverImage?.url ? (
              <figure className="mb-6 -mx-4 sm:mx-0">
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={article.coverImage.url} 
                    alt={article.title} 
                    className="w-full aspect-video object-cover" 
                  />
                </div>
              </figure>
            ) : null}

            <div className="mb-6 flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-500">షేర్ చేయండి:</span>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-[hsl(var(--primary))] hover:text-white transition-all" aria-label="Share on Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-sky-500 hover:text-white transition-all" aria-label="Share on Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-green-600 hover:text-white transition-all" aria-label="Share on WhatsApp">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
            </div>

            <div 
              className="article-content prose prose-lg max-w-none" 
              dangerouslySetInnerHTML={{ __html: article.content ?? '' }} 
            />

            <div className="mt-8 pt-6 border-t border-zinc-200">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full hover:bg-[hsl(var(--primary))] hover:text-white cursor-pointer transition-colors">వార్తలు</span>
                <span className="px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full hover:bg-[hsl(var(--primary))] hover:text-white cursor-pointer transition-colors">తాజా</span>
                <span className="px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full hover:bg-[hsl(var(--primary))] hover:text-white cursor-pointer transition-colors">ట్రెండింగ్</span>
              </div>
            </div>

            <ReporterSection article={article} />

            <div className="mt-8">
              <AdBanner variant="horizontal" size="medium" />
            </div>
          </article>

          <aside className="space-y-6">
            {sidebarLatest.length > 0 ? (
              <SectionCard title="తాజా వార్తలు">
                <TitleList tenantSlug={tenantSlug} items={sidebarLatest} />
              </SectionCard>
            ) : null}
            
            <div className="sticky top-24">
              <AdBanner variant="sidebar" size="large" />
            </div>
          </aside>
        </div>
      </main>
      
      <Footer settings={settings} tenantSlug={tenantSlug} />
      <MobileBottomNav tenantSlug={tenantSlug} />
    </div>
  )
}

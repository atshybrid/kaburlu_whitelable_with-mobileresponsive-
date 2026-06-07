import Link from 'next/link'
import { AdSlot } from '@/components/ads/AdSlot'
import { AeoContentBlocks } from '@/components/seo'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import { articleHrefFromArticle, categoryHref, homeHref } from '@/lib/url'

type ThemeHomeProps = {
  tenantSlug: string
  title: string
  articles: Article[]
  settings?: EffectiveSettings
}

type ThemeArticleProps = {
  tenantSlug: string
  title: string
  article: Article
  settings?: EffectiveSettings
}

function pickCategory(article: Article) {
  return article.category?.name || article.categories?.[0]?.name || 'Latest'
}

function pickCategorySlug(article: Article) {
  return article.category?.slug || article.categories?.[0]?.slug || 'news'
}

function pickImage(article: Article) {
  return article.coverImage?.url || ''
}

function formatDate(iso?: string | null) {
  if (!iso) return 'Just now'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Just now'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ArticleThumb({ article, className }: { article: Article; className?: string }) {
  const img = pickImage(article)
  if (img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img} alt={article.title} className={className || ''} loading="lazy" />
  }
  return <div className={`s3-ph ${className || ''}`}>📰</div>
}

function S3Header({ tenantSlug, title }: { tenantSlug: string; title: string }) {
  const sections = ['national', 'politics', 'crime', 'sports', 'entertainment', 'business', 'health']
  return (
    <header className="s3-header">
      <div className="s3-topbar">
        <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <div className="s3-top-links">
          <a href="#">WhatsApp</a>
          <a href="#">Telegram</a>
          <a href="#">YouTube</a>
        </div>
      </div>
      <div className="s3-brandbar">
        <Link href={homeHref(tenantSlug)} className="s3-logo">
          <span>{title}</span>
          <small>Advanced Telugu News</small>
        </Link>
        <div className="s3-search">Search news...</div>
      </div>
      <nav className="s3-nav" aria-label="Primary">
        <Link href={homeHref(tenantSlug)}>Home</Link>
        {sections.map((slug) => (
          <Link key={slug} href={categoryHref(tenantSlug, slug)}>
            {slug}
          </Link>
        ))}
      </nav>
    </header>
  )
}

function S3Footer({ tenantSlug, title }: { tenantSlug: string; title: string }) {
  return (
    <footer className="s3-footer">
      <div className="s3-footer-grid">
        <div>
          <h4>{title}</h4>
          <p>Fast Telugu updates, premium reading experience, and SEO-optimized category coverage for daily readers.</p>
        </div>
        <div>
          <h5>Categories</h5>
          <Link href={categoryHref(tenantSlug, 'national')}>National</Link>
          <Link href={categoryHref(tenantSlug, 'politics')}>Politics</Link>
          <Link href={categoryHref(tenantSlug, 'sports')}>Sports</Link>
          <Link href={categoryHref(tenantSlug, 'entertainment')}>Entertainment</Link>
        </div>
        <div>
          <h5>Quick Links</h5>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Advertise</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div>
          <h5>Revenue Zones</h5>
          <span>Top Banner</span>
          <span>Sidebar Sticky</span>
          <span>In-Article</span>
          <span>Multiplex End</span>
        </div>
      </div>
      <div className="s3-footer-bottom">
        <span>© {new Date().getFullYear()} {title}. All rights reserved.</span>
        <span>SEO + Ad Revenue Optimized Style 3</span>
      </div>
    </footer>
  )
}

export function ThemeHome({ tenantSlug, title, articles, settings }: ThemeHomeProps) {
  const hero = articles[0]
  const heroSide = articles.slice(1, 3)
  const latest = articles.slice(3, 15)
  const trending = articles.slice(15, 21)
  const ticker = articles.slice(0, 8)

  return (
    <div className="theme-style3">
      <S3Header tenantSlug={tenantSlug} title={title} />
      <div className="s3-ticker" aria-label="Breaking updates">
        <div className="s3-ticker-label">FLASH</div>
        <div className="s3-ticker-track">
          {ticker.map((item) => (
            <Link key={item.id} href={articleHrefFromArticle(tenantSlug, item)} className="s3-ticker-item">
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="s3-ad-wrap">
        <AdSlot slot="home_top_banner" settings={settings} className="min-h-[90px]" />
      </div>

      <main className="s3-main">
        <section className="s3-hero-wrap">
          {hero ? (
            <article className="s3-hero-main">
              <Link href={articleHrefFromArticle(tenantSlug, hero)}>
                <ArticleThumb article={hero} className="s3-hero-img" />
                <div className="s3-hero-overlay">
                  <span className="s3-cat">{pickCategory(hero)}</span>
                  <h1>{hero.title}</h1>
                  <p>{hero.excerpt || 'Read the full report with complete context and updates.'}</p>
                </div>
              </Link>
            </article>
          ) : null}

          <div className="s3-hero-side">
            {heroSide.map((item) => (
              <article key={item.id} className="s3-mini-card">
                <Link href={articleHrefFromArticle(tenantSlug, item)}>
                  <ArticleThumb article={item} className="s3-mini-img" />
                  <div className="s3-mini-body">
                    <span className="s3-cat">{pickCategory(item)}</span>
                    <h2>{item.title}</h2>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className="s3-content-grid">
          <section className="s3-feed" aria-labelledby="s3-latest">
            <div className="s3-sec-head">
              <h2 id="s3-latest">Latest News</h2>
              <Link href={homeHref(tenantSlug)}>View all</Link>
            </div>
            <div className="s3-list">
              {latest.map((item) => (
                <article key={item.id} className="s3-list-item">
                  <Link href={articleHrefFromArticle(tenantSlug, item)} className="s3-list-link">
                    <ArticleThumb article={item} className="s3-list-img" />
                    <div className="s3-list-body">
                      <span className="s3-cat">{pickCategory(item)}</span>
                      <h3>{item.title}</h3>
                      <div className="s3-meta">
                        <time dateTime={item.publishedAt || undefined}>{formatDate(item.publishedAt)}</time>
                        <span>{pickCategory(item)}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            <div className="s3-ad-wrap">
              <AdSlot slot="home_horizontal_1" settings={settings} className="min-h-[90px]" />
            </div>
          </section>

          <aside className="s3-sidebar" aria-labelledby="s3-trending">
            <div className="s3-sec-head">
              <h2 id="s3-trending">Trending</h2>
            </div>
            <ol className="s3-trending-list">
              {trending.map((item, idx) => (
                <li key={item.id} className="s3-trending-item">
                  <span className="s3-rank">{idx + 1}</span>
                  <Link href={articleHrefFromArticle(tenantSlug, item)}>{item.title}</Link>
                </li>
              ))}
            </ol>
            <div className="s3-ad-wrap">
              <AdSlot slot="home_right_1" settings={settings} className="min-h-[250px]" />
            </div>
            <div className="s3-ad-wrap">
              <AdSlot slot="home_right_2" settings={settings} className="min-h-[600px]" />
            </div>
          </aside>
        </div>
        <div className="s3-ad-wrap">
          <AdSlot slot="home_multiplex" settings={settings} className="min-h-[280px]" />
        </div>
      </main>
      <S3Footer tenantSlug={tenantSlug} title={title} />
    </div>
  )
}

export function ThemeArticle({ tenantSlug, title, article, settings }: ThemeArticleProps) {
  const html = article.contentHtml || article.content || ''
  const related = (article.related || article.trending || []).slice(0, 6)
  const safeRelated = related.filter((it) => it?.slug && it?.title)

  return (
    <div className="theme-style3">
      <S3Header tenantSlug={tenantSlug} title={title} />
      <main className="s3-article-main">
        <nav className="s3-breadcrumb" aria-label="Breadcrumb">
          <Link href={homeHref(tenantSlug)}>Home</Link>
          <span>/</span>
          <Link href={categoryHref(tenantSlug, pickCategorySlug(article))}>{pickCategory(article)}</Link>
        </nav>

        <article className="s3-article" itemScope itemType="https://schema.org/NewsArticle">
          <header className="s3-article-head">
            <span className="s3-cat">{pickCategory(article)}</span>
            <h1 itemProp="headline">{article.title}</h1>
            <div className="s3-meta">
              <time itemProp="datePublished" dateTime={article.publishedAt || undefined}>{formatDate(article.publishedAt)}</time>
              <span>{article.readingTimeMin || 3} min read</span>
              {article.viewCount ? <span>{article.viewCount.toLocaleString('en-IN')} views</span> : null}
            </div>
          </header>

          <AeoContentBlocks article={article} lang="te" variant="compact" />

          <ArticleThumb article={article} className="s3-article-img" />
          <div className="s3-ad-wrap">
            <AdSlot slot="article_horizontal" settings={settings} className="min-h-[90px]" />
          </div>

          {html ? (
            <section className="s3-article-body" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <section className="s3-article-body">
              <p>{article.excerpt || 'Full story content will appear here once synced from backend.'}</p>
            </section>
          )}
        </article>

        {safeRelated.length > 0 ? (
          <section className="s3-related" aria-labelledby="s3-related-title">
            <h2 id="s3-related-title">Related News</h2>
            <div className="s3-related-grid">
              {safeRelated.map((item) => (
                <article key={String(item.id || item.slug)} className="s3-related-card">
                  <Link href={articleHrefFromArticle(tenantSlug, { id: String(item.id || item.slug), slug: item.slug })}>
                    <div className="s3-related-title">{item.title}</div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
        <div className="s3-article-side-ads">
          <AdSlot slot="article_sidebar_top" settings={settings} className="min-h-[250px]" />
          <AdSlot slot="article_sidebar_bottom" settings={settings} className="min-h-[600px]" />
          <AdSlot slot="article_multiplex_h" settings={settings} className="min-h-[280px]" />
        </div>
      </main>
      <S3Footer tenantSlug={tenantSlug} title={title} />
    </div>
  )
}

import { ArticleGrid } from '@/components/shared/ArticleGrid'
import { Footer } from '@/components/shared/Footer'
import { Navbar } from '@/components/shared/Navbar'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'

export function ThemeHome({ tenantSlug, title, articles, settings }: { tenantSlug: string; title: string; articles: Article[]; settings?: EffectiveSettings }) {
  return (
    <div className="theme-style2">
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {articles.slice(0, 3).map((a) => (
            a.coverImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={a.id} src={a.coverImage.url} alt={a.title} className="h-56 w-full rounded-md object-cover" />
            ) : (
              <div key={a.id} className="h-56 w-full rounded-md bg-zinc-100" />
            )
          ))}
        </section>
        <ArticleGrid tenantSlug={tenantSlug} items={articles} />
      </main>
      <Footer />
    </div>
  )
}

export function ThemeArticle({ tenantSlug, title, article }: { tenantSlug: string; title: string; article: Article }) {
  return (
    <div className="theme-style2">
      <Navbar tenantSlug={tenantSlug} title={title} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">{article.title}</h1>
        {article.coverImage?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage.url} alt={article.title} className="mb-6 rounded-md" />
        )}
        <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content ?? '' }} />
      </main>
      <Footer />
    </div>
  )
}

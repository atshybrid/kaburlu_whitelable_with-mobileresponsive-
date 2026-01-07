import { ArticleGrid } from '@/components/shared/ArticleGrid'
import { Footer } from '@/components/shared/Footer'
import { Navbar } from '@/components/shared/Navbar'
import type { Article } from '@/lib/data-sources'

export function ThemeHome({ tenantSlug, title, articles }: { tenantSlug: string; title: string; articles: Article[] }) {
  return (
    <div className="theme-style3">
      <Navbar tenantSlug={tenantSlug} title={title} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <ArticleGrid tenantSlug={tenantSlug} items={articles} />
      </main>
      <Footer tenantSlug={tenantSlug} />
    </div>
  )
}

export function ThemeArticle({ tenantSlug, title, article }: { tenantSlug: string; title: string; article: Article }) {
  return (
    <div className="theme-style3">
      <Navbar tenantSlug={tenantSlug} title={title} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold">{article.title}</h1>
        {article.coverImage?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage.url} alt={article.title} className="mb-4 rounded-md" />
        )}
        <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content ?? '' }} />
      </main>
      <Footer tenantSlug={tenantSlug} />
    </div>
  )
}

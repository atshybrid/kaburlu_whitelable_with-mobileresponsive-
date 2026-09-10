import Link from 'next/link'
import type { UrlObject } from 'url'
import type { Article } from '@/lib/data-sources'
import { getArticleExcerpt } from '@/lib/article-excerpt'
import { articleHref, getCategorySlugFromArticle } from '@/lib/url'
import { PlaceholderImg } from './PlaceholderImg'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

export function ArticleCard({
  tenantSlug,
  article,
}: {
  tenantSlug: string
  article: Article
}) {
  const categorySlug = getCategorySlugFromArticle(article)
  const href = articleHref(tenantSlug, article.slug || article.id, categorySlug)
  const excerpt = getArticleExcerpt(article)
  const imageUrl =
    article.coverImage?.url ||
    (article as Record<string, unknown>).coverImageUrl as string | undefined

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-zinc-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-red-200 transition-all duration-300 ease-out cursor-pointer">
      <Link href={toHref(href)} className="relative overflow-hidden block">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={article.title}
            className="h-44 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <PlaceholderImg className="h-44 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={toHref(href)} className="text-lg font-semibold leading-snug text-zinc-900 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
          {article.title}
        </Link>
        {excerpt ? (
          <p className="text-sm text-zinc-600 line-clamp-2">{excerpt}</p>
        ) : null}
      </div>
    </article>
  )
}

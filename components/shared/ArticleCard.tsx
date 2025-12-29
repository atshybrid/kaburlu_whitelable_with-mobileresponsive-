import Link from 'next/link'
import type { UrlObject } from 'url'
import type { Article } from '@/lib/data-sources'
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
  const href = `/t/${tenantSlug}/article/${article.slug}`
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm">
      {article.coverImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.coverImage.url} alt={article.title} className="h-44 w-full object-cover" />
      ) : (
        <PlaceholderImg className="h-44 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={toHref(href)} className="text-lg font-semibold leading-snug hover:underline">
          {article.title}
        </Link>
        <p className="text-sm text-zinc-600">
          {article.excerpt || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
        </p>
      </div>
    </article>
  )
}

import { ArticleStructuredData } from './ArticleStructuredData'
import { buildArticleSeoContext } from '@/lib/article-seo-context'
import type { Article } from '@/lib/data-sources'

export interface ArticlePageAeoProps {
  article: Article
  categorySlug: string
  domain: string
  tenantName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: any
  tenantSlug?: string
}

/** Server component: injects AEO/GEO JSON-LD on article pages */
export function ArticlePageAeo(props: ArticlePageAeoProps) {
  const ctx = buildArticleSeoContext(props)

  return (
    <ArticleStructuredData
      article={props.article}
      canonicalUrl={ctx.canonicalUrl}
      siteName={ctx.siteName}
      siteUrl={ctx.siteUrl}
      publisherLogo={ctx.publisherLogo}
      lang={ctx.lang}
      categoryName={ctx.categoryName}
      categorySlug={ctx.categorySlug}
    />
  )
}

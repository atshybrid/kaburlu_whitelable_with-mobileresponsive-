import { buildArticleAeoGraph, type AeoArticleContext } from '@/lib/aeo'
import type { Article } from '@/lib/data-sources'

export interface ArticleStructuredDataProps {
  article: Article
  canonicalUrl: string
  siteName: string
  siteUrl: string
  publisherLogo?: string | null
  lang?: string
  categoryName?: string
  categorySlug?: string
}

/**
 * Injects AEO/GEO JSON-LD schemas for article pages:
 * NewsArticle (with Speakable + E-E-A-T author), BreadcrumbList, FAQPage, Entity markup
 */
export function ArticleStructuredData(props: ArticleStructuredDataProps) {
  const ctx: AeoArticleContext = {
    article: props.article,
    canonicalUrl: props.canonicalUrl,
    siteName: props.siteName,
    siteUrl: props.siteUrl,
    publisherLogo: props.publisherLogo,
    lang: props.lang,
    categoryName: props.categoryName,
    categorySlug: props.categorySlug,
  }

  const { schemas } = buildArticleAeoGraph(ctx)

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={`aeo-schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

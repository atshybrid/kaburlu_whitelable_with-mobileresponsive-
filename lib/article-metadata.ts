import type { Metadata } from 'next'
import type { Article } from '@/lib/data-sources'
import { discoverOgImages, discoverRobots } from '@/lib/metadata'

export interface ArticleMetadataInput {
  article: Article
  categorySlug: string
  articleSlug: string
  canonicalBase: string
  publisherName: string
  pathPrefix?: string
  /** Override canonical path (e.g. /t/tenant/article/slug). */
  canonicalPath?: string
}

/** Extract SEO fields from article API response (seo.* preferred). */
export function getArticleSeoFields(article: Article, fallbackUrl: string) {
  const title =
    article.seo?.metaTitle ||
    article.meta?.seoTitle ||
    article.title ||
    ''

  const description =
    article.seo?.metaDescription ||
    article.meta?.metaDescription ||
    article.excerpt ||
    ''

  const canonicalUrl = article.seo?.canonicalUrl || fallbackUrl

  const image =
    article.seo?.ogImage ||
    article.coverImage?.url ||
    (article as Record<string, unknown>).coverImageUrl as string | undefined

  return { title, description, canonicalUrl, image }
}

export function buildArticlePageMetadata(input: ArticleMetadataInput): Metadata {
  const {
    article,
    categorySlug,
    articleSlug,
    canonicalBase,
    publisherName,
    pathPrefix = '',
  } = input

  const fallbackUrl = input.canonicalPath
    ? `${canonicalBase}${input.canonicalPath}`
    : `${canonicalBase}${pathPrefix}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}`
  const { title, description, canonicalUrl, image } = getArticleSeoFields(article, fallbackUrl)

  const createdAt = article.publishedAt || undefined
  const updatedAt = article.updatedAt || createdAt

  const categoryName =
    article.category?.name ||
    article.categories?.[0]?.name

  const authorName =
    article.reporter?.name ||
    article.authors?.[0]?.name

  return {
    title,
    description,
    authors: authorName ? [{ name: authorName }] : [],
    robots: discoverRobots,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: publisherName,
      type: 'article',
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      ...(categoryName ? { section: categoryName } : {}),
      ...(authorName ? { authors: [authorName] } : {}),
      images: discoverOgImages(image, title),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

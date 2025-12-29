import React from 'react'

export type SeoArticle = {
  title: string
  summary?: string | null
  image?: string | null
  slug: string
  createdAt?: string | null
  updatedAt?: string | null
  categoryName?: string | null
  keywords?: string[] | null
  authorName?: string | null
  location?: string | null
}

export type SeoTenant = {
  domain: string
  language: string
  publisherName: string
  publisherLogo?: string | null
}

function normalizeLang(language: string) {
  const raw = String(language || 'en').trim().toLowerCase()
  if (!raw) return 'en'
  if (raw === 'telugu') return 'te'
  if (raw === 'hindi') return 'hi'
  if (raw === 'tamil') return 'ta'
  if (raw === 'kannada') return 'kn'
  return raw.split('-')[0]
}

function normalizeUrl(u: string) {
  const s = String(u || '').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  return `https://${s}`
}

function safeText(v: unknown, fallback = '') {
  const s = String(v ?? '').trim()
  return s || fallback
}

function uniqStrings(items: unknown, max = 20): string[] {
  const arr = Array.isArray(items) ? items : []
  const out: string[] = []
  const seen = new Set<string>()
  for (const v of arr) {
    const s = String(v ?? '').trim()
    if (!s) continue
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
    if (out.length >= max) break
  }
  return out
}

export default function SeoMaster({
  article,
  tenant,
  url,
}: {
  article: SeoArticle
  tenant: SeoTenant
  url: string
}) {
  const lang = normalizeLang(tenant.language)
  const canonicalUrl = normalizeUrl(url)

  const title = safeText(article.title, tenant.publisherName)
  const description = safeText(article.summary, title)

  const imageUrl = normalizeUrl(article.image || '')
  const publisherLogo = normalizeUrl(tenant.publisherLogo || '')

  const keywords = uniqStrings(article.keywords)
  const authorName = safeText(article.authorName, tenant.publisherName)
  const categoryName = safeText(article.categoryName)
  const locationName = safeText(article.location, 'India')

  const datePublished = safeText(article.createdAt)
  const dateModified = safeText(article.updatedAt || article.createdAt)

  const hreflangs = buildHreflang({ lang, href: canonicalUrl })

  const jsonLd = buildNewsArticleJsonLd({
    url: canonicalUrl,
    lang,
    title,
    description,
    imageUrl,
    datePublished,
    dateModified,
    authorName,
    publisherName: tenant.publisherName,
    publisherLogo,
    categoryName,
    keywords,
    locationName,
  })

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow,max-image-preview:large" />

      <link rel="canonical" href={canonicalUrl} />

      {hreflangs.map((l) => (
        <link key={l.hrefLang} rel="alternate" hrefLang={l.hrefLang} href={l.href} />
      ))}

      {/* Open Graph (article) */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={tenant.publisherName} />
      {imageUrl ? (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="675" />
        </>
      ) : null}
      {datePublished ? <meta property="article:published_time" content={datePublished} /> : null}
      {dateModified ? <meta property="article:modified_time" content={dateModified} /> : null}
      {categoryName ? <meta property="article:section" content={categoryName} /> : null}
      {keywords.map((k) => (
        <meta key={k} property="article:tag" content={k} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}

      {/* JSON-LD NewsArticle */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* inLanguage hint (non-standard but harmless) */}
      <meta property="og:locale" content={`${lang}_IN`} />
    </>
  )
}

export function buildHreflang({ lang, href }: { lang: string; href: string }) {
  const l = normalizeLang(lang)
  const countries = ['IN', 'US', 'AE', 'GB', 'CA', 'AU'] as const
  const list = countries.map((c) => ({ hrefLang: `${l}-${c}`, href }))
  list.push({ hrefLang: 'x-default', href })
  return list
}

export function buildNewsArticleJsonLd({
  url,
  lang,
  title,
  description,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  publisherName,
  publisherLogo,
  categoryName,
  keywords,
  locationName,
}: {
  url: string
  lang: string
  title: string
  description: string
  imageUrl?: string
  datePublished?: string
  dateModified?: string
  authorName: string
  publisherName: string
  publisherLogo?: string
  categoryName?: string
  keywords: string[]
  locationName: string
}) {
  const image: Record<string, unknown> | undefined = imageUrl
    ? {
        '@type': 'ImageObject',
        url: imageUrl,
        width: 1200,
        height: 675,
      }
    : undefined

  const publisherLogoObj: Record<string, unknown> | undefined = publisherLogo
    ? {
        '@type': 'ImageObject',
        url: publisherLogo,
        width: 600,
        height: 60,
      }
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    description,
    ...(image ? { image } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      ...(publisherLogoObj ? { logo: publisherLogoObj } : {}),
    },
    ...(categoryName ? { articleSection: categoryName } : {}),
    ...(keywords.length ? { keywords } : {}),
    inLanguage: normalizeLang(lang),
    isAccessibleForFree: true,
    contentLocation: {
      '@type': 'Place',
      name: locationName,
    },
  }
}

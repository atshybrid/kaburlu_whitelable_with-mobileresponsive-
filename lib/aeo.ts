/**
 * AEO + GEO (Generative Engine Optimization) utilities
 *
 * Builds structured data and content blocks optimized for:
 * - Google AI Overviews / Answer engines
 * - ChatGPT, Perplexity, Claude crawlers
 * - Voice assistants (Speakable schema)
 */

import type { Article } from '@/lib/data-sources'

export interface FaqItem {
  question: string
  answer: string
}

export interface AeoArticleContext {
  article: Article
  canonicalUrl: string
  siteName: string
  siteUrl: string
  publisherLogo?: string | null
  lang?: string
  categoryName?: string
  categorySlug?: string
}

function normalizeLang(language?: string): string {
  const raw = String(language || 'te').trim().toLowerCase()
  if (raw === 'telugu') return 'te'
  if (raw === 'hindi') return 'hi'
  if (raw === 'tamil') return 'ta'
  if (raw === 'kannada') return 'kn'
  return raw.split('-')[0] || 'te'
}

function pickAuthorName(article: Article, siteName: string): string {
  return (
    article.reporter?.name ||
    article.authors?.[0]?.name ||
    siteName
  )
}

function pickImageUrl(article: Article): string | undefined {
  return (
    article.coverImage?.url ||
    (article as Record<string, unknown>).coverImageUrl as string | undefined ||
    undefined
  )
}

/** Build FAQ pairs from highlights only (summary shown separately on article page) */
export function buildFaqFromArticle(
  article: Article,
  lang = 'te',
  opts?: { skipSummaryQuestion?: boolean; skipHighlightsInFaq?: boolean },
): FaqItem[] {
  const items: FaqItem[] = []
  const title = article.title?.trim()
  if (!title) return items

  const labels: Record<string, { about: string; key: string }> = {
    te: { about: 'ఈ వార్త గురించి సంక్షిప్తంగా చెప్పండి?', key: 'ముఖ్య అంశం' },
    en: { about: 'What is this article about?', key: 'Key point' },
    hi: { about: 'इस लेख के बारे में संक्षेप में बताएं?', key: 'मुख्य बिंदु' },
    ta: { about: 'இந்த கட்டுரை எதைப் பற்றியது?', key: 'முக்கிய புள்ளி' },
    kn: { about: 'ಈ ಲೇಖನದ ಬಗ್ಗೆ ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಹೇಳಿ?', key: 'ಮುಖ್ಯ ಅಂಶ' },
  }
  const l = labels[normalizeLang(lang)] || labels.te

  const highlights = (article.highlights || []).filter(Boolean).slice(0, 4)

  // Only add summary FAQ when summary is NOT already shown on the page
  if (!opts?.skipSummaryQuestion && article.excerpt?.trim() && highlights.length === 0) {
    items.push({ question: l.about, answer: article.excerpt.trim() })
  }

  if (!opts?.skipHighlightsInFaq) {
    highlights.forEach((h, i) => {
      items.push({
        question: `${l.key} ${i + 1}`,
        answer: h.trim(),
      })
    })
  }

  return items.slice(0, 6)
}

/** BreadcrumbList JSON-LD */
export function buildBreadcrumbSchema(ctx: AeoArticleContext) {
  const { siteUrl, siteName, categoryName, categorySlug, canonicalUrl } = ctx
  const elements: Array<Record<string, unknown>> = [
    { '@type': 'ListItem', position: 1, name: siteName, item: siteUrl },
  ]

  if (categorySlug && categoryName) {
    elements.push({
      '@type': 'ListItem',
      position: 2,
      name: categoryName,
      item: `${siteUrl}/${encodeURIComponent(categorySlug)}`,
    })
  }

  elements.push({
    '@type': 'ListItem',
    position: elements.length + 1,
    name: ctx.article.title,
    item: canonicalUrl,
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: elements,
  }
}

/** FAQPage JSON-LD from article content */
export function buildFaqSchema(faqItems: FaqItem[]) {
  if (faqItems.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/** Enhanced NewsArticle with Speakable + author E-E-A-T */
export function buildEnhancedNewsArticleSchema(ctx: AeoArticleContext) {
  const { article, canonicalUrl, siteName, publisherLogo, lang } = ctx
  const authorName = pickAuthorName(article, siteName)
  const imageUrl = pickImageUrl(article)
  const language = normalizeLang(lang)

  const authorSchema: Record<string, unknown> = {
    '@type': 'Person',
    name: authorName,
    ...(article.reporter?.designation ? { jobTitle: article.reporter.designation } : {}),
    ...(article.reporter?.photoUrl ? { image: article.reporter.photoUrl } : {}),
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      ...(publisherLogo ? { logo: { '@type': 'ImageObject', url: publisherLogo } } : {}),
    },
  }

  const location = article.reporter?.location
  const contentLocation =
    location?.district || location?.state
      ? {
          '@type': 'Place',
          name: [location.district, location.state].filter(Boolean).join(', ') || 'India',
          ...(location.state
            ? { address: { '@type': 'PostalAddress', addressRegion: location.state, addressCountry: 'IN' } }
            : {}),
        }
      : undefined

  const speakableText = [article.excerpt, ...(article.highlights || [])].filter(Boolean).join(' ')

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': canonicalUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    headline: article.title,
    description: article.excerpt || article.meta?.metaDescription || article.title,
    ...(imageUrl
      ? { image: { '@type': 'ImageObject', url: imageUrl, width: 1200, height: 675 } }
      : {}),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.updatedAt || article.publishedAt
      ? { dateModified: article.updatedAt || article.publishedAt }
      : {}),
    author: authorSchema,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      ...(publisherLogo ? { logo: { '@type': 'ImageObject', url: publisherLogo } } : {}),
    },
    ...(ctx.categoryName ? { articleSection: ctx.categoryName } : {}),
    ...(article.tags?.length ? { keywords: article.tags.join(', ') } : {}),
    inLanguage: language,
    isAccessibleForFree: true,
    ...(contentLocation ? { contentLocation } : {}),
    ...(speakableText
      ? {
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['.aeo-tldr', '.aeo-key-facts', '.aeo-faq-answer'],
          },
        }
      : {}),
  }
}

/** Entity mentions from tags + location (GEO) */
export function buildEntitySchema(ctx: AeoArticleContext) {
  const entities: Record<string, unknown>[] = []
  const tags = (ctx.article.tags || []).slice(0, 8)

  tags.forEach((tag) => {
    entities.push({
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: tag,
      url: ctx.canonicalUrl,
    })
  })

  const loc = ctx.article.reporter?.location
  if (loc?.state) {
    entities.push({
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: loc.district ? `${loc.district}, ${loc.state}` : loc.state,
      address: {
        '@type': 'PostalAddress',
        addressRegion: loc.state,
        addressCountry: 'IN',
      },
    })
  }

  return entities
}

/** Combine all article JSON-LD graphs */
export function buildArticleAeoGraph(ctx: AeoArticleContext) {
  const faqItems = buildFaqFromArticle(ctx.article, ctx.lang)
  const schemas: Record<string, unknown>[] = [
    buildEnhancedNewsArticleSchema(ctx),
    buildBreadcrumbSchema(ctx),
  ]

  const faqSchema = buildFaqSchema(faqItems)
  if (faqSchema) schemas.push(faqSchema)

  schemas.push(...buildEntitySchema(ctx))

  return { schemas, faqItems }
}

/** Generate llms.txt content (LLM crawler guide) */
export function generateLlmsTxt(opts: {
  siteName: string
  siteUrl: string
  description: string
  lang?: string
  categories?: Array<{ name: string; slug: string }>
  recentArticles?: Array<{ title: string; url: string; excerpt?: string }>
}): string {
  const { siteName, siteUrl, description, categories = [], recentArticles = [] } = opts

  const lines: string[] = [
    `# ${siteName}`,
    `> ${description}`,
    '',
    '## About',
    `${siteName} is a digital news platform publishing verified news articles.`,
    '',
    '## AI Usage Policy',
    `- Content may be cited with attribution and link to ${siteUrl}`,
    '- Full AI policy: ' + `${siteUrl}/ai-policy`,
    '',
    '## Key Pages',
    `- [Home](${siteUrl}/)`,
    `- [Contact](${siteUrl}/contact)`,
    `- [About Us](${siteUrl}/about-us)`,
    `- [AI Policy](${siteUrl}/ai-policy)`,
    `- [Sitemap](${siteUrl}/sitemap-index.xml)`,
    `- [RSS Feed](${siteUrl}/rss)`,
    `- [Feed XML](${siteUrl}/feed.xml)`,
    `- [Google News Sitemap](${siteUrl}/sitemap-news.xml)`,
    `- [Full Content Index](${siteUrl}/llms-full.txt)`,
    '',
  ]

  if (categories.length > 0) {
    lines.push('## Categories')
    categories.forEach((c) => {
      lines.push(`- [${c.name}](${siteUrl}/${encodeURIComponent(c.slug)})`)
    })
    lines.push('')
  }

  if (recentArticles.length > 0) {
    lines.push('## Recent Articles')
    recentArticles.forEach((a) => {
      const excerpt = a.excerpt ? `: ${a.excerpt.slice(0, 120)}` : ''
      lines.push(`- [${a.title}](${a.url})${excerpt}`)
    })
    lines.push('')
  }

  lines.push('## Technical')
  lines.push(`- Language: ${opts.lang || 'te'}`)
  lines.push(`- Canonical domain: ${siteUrl}`)
  lines.push(`- Robots: ${siteUrl}/robots.txt`)
  lines.push('')
  lines.push('---')
  lines.push(`Generated for LLM crawlers. Last updated: ${new Date().toISOString().split('T')[0]}`)

  return lines.join('\n')
}

/** Generate llms-full.txt with extended article list */
export function generateLlmsFullTxt(opts: {
  siteName: string
  siteUrl: string
  description: string
  articles: Array<{
    title: string
    url: string
    excerpt?: string
    category?: string
    publishedAt?: string
  }>
}): string {
  const { siteName, siteUrl, description, articles } = opts

  const lines: string[] = [
    `# ${siteName} — Full Content Index`,
    `> ${description}`,
    '',
    `Total articles: ${articles.length}`,
    '',
    '## Articles',
    '',
  ]

  articles.forEach((a, i) => {
    lines.push(`### ${i + 1}. ${a.title}`)
    lines.push(`URL: ${a.url}`)
    if (a.category) lines.push(`Category: ${a.category}`)
    if (a.publishedAt) lines.push(`Published: ${a.publishedAt}`)
    if (a.excerpt) lines.push(`Summary: ${a.excerpt}`)
    lines.push('')
  })

  lines.push('---')
  lines.push(`See also: ${siteUrl}/llms.txt`)

  return lines.join('\n')
}

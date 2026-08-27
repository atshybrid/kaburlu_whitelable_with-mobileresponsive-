/**
 * SEO-Friendly Article Page for Path-based Multitenancy
 *
 * URL: /t/[tenant]/[slug]/[articleSlug]
 * Example: localhost:3000/t/kaburlutoday/politics/some-article-slug
 *
 * ✅ Supports the new /{category}/{article-slug} URL structure in path mode
 * ✅ Mirrors app/[slug]/[articleSlug]/page.tsx for domain mode
 */

import { getArticleBySlug } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain, getEffectiveSettingsForDomain } from '@/lib/settings'
import { agentEnhanceArticle } from '@/lib/ai-agent'
import { ArticlePageAeo } from '@/components/seo'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { notFound } from 'next/navigation'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'
import type { Metadata } from 'next'
import { buildArticlePageMetadata } from '@/lib/article-metadata'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Reserved slugs that should NOT be treated as category slugs
const RESERVED_SLUGS = [
  'article',
  'category',
  'api',
  'search',
  'about',
  'contact',
  'privacy-policy',
  'terms',
  'sitemap',
  'robots',
  '_next',
  'static',
]

function pickString(v: unknown) {
  const s = String(v ?? '').trim()
  return s || undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; slug: string; articleSlug: string }>
}): Promise<Metadata> {
  const { tenant: tenantSlug, slug: categorySlug, articleSlug } = await params

  if (RESERVED_SLUGS.includes(categorySlug.toLowerCase())) {
    return { title: 'Not Found' }
  }

  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  const domain = tenant.domain || 'localhost'

  const article = await getArticleBySlug(tenant.id, articleSlug)
  if (!article) return { title: 'Article Not Found' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await getEffectiveSettingsForDomain(domain).catch(() => ({})) as any

  const canonicalBase =
    pickString(settings?.seo?.canonicalBaseUrl) ||
    pickString(settings?.settings?.seo?.canonicalBaseUrl) ||
    (domain === 'localhost' ? 'http://localhost:3000' : `https://${domain}`)

  const publisherName =
    pickString(settings?.branding?.siteName) ||
    pickString(settings?.settings?.branding?.siteName) ||
    tenant.name ||
    'Kaburlu News'

  return buildArticlePageMetadata({
    article,
    categorySlug,
    articleSlug,
    canonicalBase,
    publisherName,
    pathPrefix: `/t/${tenantSlug}`,
  })
}

async function getThemeArticle(themeKey: string) {
  switch (themeKey) {
    case 'style2':
      return (await import('@/themes/style2')).ThemeArticle
    case 'style3':
      return (await import('@/themes/style3')).ThemeArticle
    case 'tv9':
      return (await import('@/themes/tv9')).ThemeArticle
    case 'toi':
      return (await import('@/themes/toi')).ThemeArticle
    case 'style1':
    default:
      return (await import('@/themes/style1')).ThemeArticle
  }
}

export default async function TenantSEOArticlePage({
  params,
}: {
  params: Promise<{ tenant: string; slug: string; articleSlug: string }>
}) {
  const { tenant: tenantSlug, slug: categorySlug, articleSlug } = await params

  if (RESERVED_SLUGS.includes(categorySlug.toLowerCase())) {
    return notFound()
  }

  const tenant = await resolveTenant({ slugOverride: tenantSlug })

  if (tenant.isDomainNotLinked) {
    return <DomainNotLinked domain={tenant.domain || 'unknown'} />
  }

  if (tenant.isApiError) {
    return (
      <TechnicalIssues
        title="Technical Issues"
        message="We're experiencing technical difficulties. Please contact Kaburlu Media support."
      />
    )
  }

  if (tenant.domain) {
    const settingsResult = await getSettingsResultForDomain(tenant.domain)
    if (settingsResult.isDomainNotLinked) {
      return <DomainNotLinked domain={tenant.domain} />
    }
    if (settingsResult.isApiError) {
      return (
        <TechnicalIssues
          title="Technical Issues"
          message="We're experiencing technical difficulties. Please contact Kaburlu Media support."
        />
      )
    }
  }

  // Fetch article by articleSlug (category is for SEO URL, article is fetched by slug)
  const rawArticle = await getArticleBySlug(tenant.id, articleSlug)
  if (!rawArticle) return notFound()

  const domain = tenant.domain || 'localhost'
  const settings = await getEffectiveSettingsForDomain(domain).catch(() => ({}))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentLang = (settings as any)?.content?.defaultLanguage || (settings as any)?.locale || 'te'
  const article = await agentEnhanceArticle(rawArticle, { lang: agentLang, siteName: tenant.name })

  // Optional canonical URL check
  const articleCategorySlug = article.category?.slug || article.categories?.[0]?.slug
  if (articleCategorySlug && articleCategorySlug !== categorySlug) {
    console.warn(`Category mismatch: URL has "${categorySlug}" but article has "${articleCategorySlug}"`)
  }

  type ArticleComp = (p: { tenantSlug: string; title: string; article: Article; tenantDomain?: string }) => ReactElement | Promise<ReactElement>
  const Comp = (await getThemeArticle(tenant.themeKey)) as ArticleComp

  return (
    <>
      <ArticlePageAeo
        article={article}
        categorySlug={categorySlug}
        domain={domain}
        tenantName={tenant.name}
        settings={settings}
        tenantSlug={tenant.slug}
      />
      <Comp tenantSlug={tenant.slug} title={tenant.name} article={article} tenantDomain={tenant.domain || undefined} />
    </>
  )
}

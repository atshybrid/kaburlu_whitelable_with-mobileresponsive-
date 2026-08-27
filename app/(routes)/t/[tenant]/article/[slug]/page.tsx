import { getArticleBySlug } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain, getEffectiveSettingsForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { notFound } from 'next/navigation'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'
import type { Metadata } from 'next'
import { buildArticlePageMetadata } from '@/lib/article-metadata'

function pickString(v: unknown) {
  const s = String(v ?? '').trim()
  return s || undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>
}): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params
  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  const domain = tenant.domain || 'localhost'
  
  const article = await getArticleBySlug(tenant.id, slug)
  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  // Get settings for publisher info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await getEffectiveSettingsForDomain(domain).catch(() => ({})) as any
  
  const canonicalBase =
    pickString(settings?.seo?.canonicalBaseUrl) ||
    pickString(settings?.settings?.seo?.canonicalBaseUrl) ||
    (domain === 'localhost' ? 'http://localhost:3000' : `https://${domain}`)
  
  const publisherName =
    pickString(settings?.branding?.siteName) ||
    pickString(settings?.settings?.branding?.siteName) ||
    'Kaburlu News'

  return buildArticlePageMetadata({
    article,
    categorySlug: article.category?.slug || article.categories?.[0]?.slug || 'news',
    articleSlug: slug,
    canonicalBase,
    publisherName,
    canonicalPath: `/t/${encodeURIComponent(tenantSlug)}/article/${encodeURIComponent(slug)}`,
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

export default async function ArticlePage({ params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant: tenantSlug, slug } = await params
  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  
  // Check domain settings for this tenant
  if (tenant.domain) {
    const settingsResult = await getSettingsResultForDomain(tenant.domain)
    
    // Handle domain not linked case
    if (settingsResult.isDomainNotLinked) {
      return <DomainNotLinked domain={tenant.domain} />
    }
    
    // Handle API error case
    if (settingsResult.isApiError) {
      return (
        <TechnicalIssues 
          title="Technical Issues"
          message="We're experiencing technical difficulties with our API services. Please contact Kaburlu Media support."
        />
      )
    }
  }
  
  const article = await getArticleBySlug(tenant.id, slug)
  if (!article) return notFound()

  type ArticleComp = (p: { tenantSlug: string; title: string; article: Article; tenantDomain?: string }) => ReactElement | Promise<ReactElement>
  const Comp = (await getThemeArticle(tenant.themeKey)) as ArticleComp

  return <Comp tenantSlug={tenant.slug} title={tenant.name} article={article} tenantDomain={tenant.domain || undefined} />
}

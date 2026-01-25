import { getArticleBySlug } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import { getSettingsResultForDomain, getEffectiveSettingsForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { notFound } from 'next/navigation'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'
import type { Metadata } from 'next'

// Helper functions for metadata extraction
function pickString(v: unknown) {
  const s = String(v ?? '').trim()
  return s || undefined
}

function pickFrom(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj
  for (const key of path) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

function pickFirstString(...vals: unknown[]) {
  for (const v of vals) {
    const s = pickString(v)
    if (s) return s
  }
  return undefined
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
  
  const a = article as Record<string, unknown>
  
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
  
  // Prefer explicit SEO fields from backend if present
  const seoTitle = pickString(pickFrom(a, ['meta', 'seoTitle']))
  const seoDescription = pickString(pickFrom(a, ['meta', 'metaDescription']))
  
  const title = String(seoTitle || article.title || '')
  const description = pickFirstString(
    seoDescription,
    a.excerpt,
    a.summary,
    a.description,
    typeof a.plainText === 'string' ? a.plainText.slice(0, 220) : undefined,
  ) || ''
  
  // Priority: coverImageUrl (new API), then coverImage.url (legacy), then other fields
  const image = pickFirstString(
    a.coverImageUrl,
    pickFrom(a, ['coverImage', 'url']),
    a.imageUrl,
    a.featuredImage,
    a.image
  )
  
  const url = `${canonicalBase}/t/${encodeURIComponent(tenantSlug)}/article/${encodeURIComponent(slug)}`
  
  const createdAt = pickString(a.publishedAt) || pickString(a.createdAt)
  const updatedAt = pickString(a.updatedAt) || createdAt
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: publisherName,
      type: 'article',
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 675,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  }
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

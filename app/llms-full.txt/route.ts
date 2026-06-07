import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'
import { getConfig } from '@/lib/config'
import { fetchJSON } from '@/lib/remote'
import { generateLlmsFullTxt } from '@/lib/aeo'

interface ArticleListItem {
  slug: string
  title?: string
  excerpt?: string
  summary?: string
  publishedAt?: string
  published_at?: string
  category?: { slug?: string; name?: string }
}

interface ArticlesResponse {
  data?: ArticleListItem[]
  items?: ArticleListItem[]
  articles?: ArticleListItem[]
}

export async function GET() {
  try {
    const domain = await getTenantDomain()
    const protocol = domain.includes('localhost') ? 'http' : 'https'
    const siteUrl = `${protocol}://${domain}`

    const config = await getConfig()
    const siteName = config?.branding?.siteName || config?.tenant?.displayName || domain
    const description =
      config?.seo?.meta?.description ||
      `${siteName} — full article index for AI crawlers`

    const response = await fetchJSON<ArticlesResponse>(
      '/public/articles?page=1&pageSize=500&sortBy=publishedAt&order=desc',
      { tenantDomain: domain, revalidateSeconds: 1800 },
    ).catch(() => null)

    const raw = response?.data || response?.items || response?.articles || []

    const articles = raw
      .filter((a) => a.slug)
      .map((a) => ({
        title: a.title || a.slug,
        url: `${siteUrl}/${a.category?.slug || 'news'}/${a.slug}`,
        excerpt: a.excerpt || a.summary,
        category: a.category?.name,
        publishedAt: a.publishedAt || a.published_at,
      }))

    const content = generateLlmsFullTxt({
      siteName,
      siteUrl,
      description,
      articles,
    })

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
    })
  } catch (error) {
    console.error('Error generating llms-full.txt:', error)
    return new NextResponse('# llms-full.txt\n> Content temporarily unavailable\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 1800

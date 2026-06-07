import { NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'
import { getConfig } from '@/lib/config'
import { fetchJSON } from '@/lib/remote'
import { generateLlmsTxt } from '@/lib/aeo'

interface ArticleListItem {
  slug: string
  title?: string
  excerpt?: string
  category?: { slug?: string; name?: string }
}

interface ArticlesResponse {
  data?: ArticleListItem[]
  items?: ArticleListItem[]
  articles?: ArticleListItem[]
}

interface CategoryItem {
  slug?: string
  name?: string
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
      `${siteName} — latest news and updates`

    const lang = config?.content?.defaultLanguage || 'te'

    const [articlesRes, categoriesRes] = await Promise.all([
      fetchJSON<ArticlesResponse>(
        '/public/articles?page=1&pageSize=30&sortBy=publishedAt&order=desc',
        { tenantDomain: domain, revalidateSeconds: 1800 },
      ).catch(() => null),
      fetchJSON<{ data?: CategoryItem[]; items?: CategoryItem[] }>(
        '/public/categories',
        { tenantDomain: domain, revalidateSeconds: 3600 },
      ).catch(() => null),
    ])

    const articles = articlesRes?.data || articlesRes?.items || articlesRes?.articles || []
    const categories = (categoriesRes?.data || categoriesRes?.items || [])
      .filter((c) => c.slug && c.name)
      .slice(0, 12)
      .map((c) => ({ name: c.name!, slug: c.slug! }))

    const recentArticles = articles.slice(0, 20).map((a) => ({
      title: a.title || a.slug,
      url: `${siteUrl}/${a.category?.slug || 'news'}/${a.slug}`,
      excerpt: a.excerpt,
    }))

    const content = generateLlmsTxt({
      siteName,
      siteUrl,
      description,
      lang,
      categories,
      recentArticles,
    })

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating llms.txt:', error)
    return new NextResponse('# llms.txt\n> Content temporarily unavailable\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600

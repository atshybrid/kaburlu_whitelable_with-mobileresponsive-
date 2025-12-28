import { getArticleBySlug } from '@/lib/data'
import { getTenantFromHeaders } from '@/lib/tenant'
import { ThemeArticle as Style1Article } from '@/themes/style1'
import { ThemeArticle as Style2Article } from '@/themes/style2'
import { ThemeArticle as Style3Article } from '@/themes/style3'
import { ThemeArticle as Tv9Article } from '@/themes/tv9'
import { notFound } from 'next/navigation'
import type { Article } from '@/lib/data-sources'
import type { ReactElement } from 'react'

export default async function ArticlePage({ params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { slug } = await params
  const tenant = await getTenantFromHeaders()
  const article = await getArticleBySlug(tenant.id, slug)
  if (!article) return notFound()

  type ArticleComp = (p: { tenantSlug: string; title: string; article: Article }) => ReactElement | Promise<ReactElement>
  const map: Record<string, ArticleComp> = {
    style1: Style1Article,
    style2: Style2Article,
    style3: Style3Article,
    tv9: Tv9Article,
  }
  const Comp = map[tenant.themeKey] || Style1Article

  return <Comp tenantSlug={tenant.slug} title={tenant.name} article={article} />
}

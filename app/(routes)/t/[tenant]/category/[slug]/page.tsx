import { getTenantFromHeaders } from '@/lib/tenant'
import { ArticleGrid } from '@/components/shared/ArticleGrid'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { getArticlesByCategory } from '@/lib/data'

export default async function CategoryPage({ params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { slug } = await params
  const tenant = await getTenantFromHeaders()
  const articles = await getArticlesByCategory(tenant.id, slug)

  return (
    <div>
      <Navbar tenantSlug={tenant.slug} title={tenant.name} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">{slug.replace(/-/g, ' ')}</h1>
        <ArticleGrid tenantSlug={tenant.slug} items={articles} />
      </main>
      <Footer />
    </div>
  )
}

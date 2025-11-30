import { getCategories, getArticlesByCategory } from '../../../lib/data'
import Sidebar from '../../../components/Sidebar'
import ArticleCard from '../../../components/ArticleCard'

// Force dynamic rendering to avoid build-time pre-render timeouts when upstream layout fetches stall
export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const cats = getCategories()
  const cat = cats.find(c=>c.slug===slug)
  if (!cat) return <div className="p-4">Not found</div>
  const items = getArticlesByCategory(cat.slug)
  return (
    <main className="py-4">
      <h1 className="text-2xl font-extrabold mb-3">{cat.name}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg overflow-hidden border border-gray-200">
          {items.map(a => <ArticleCard key={a.id} a={a} />)}
        </div>
        <Sidebar />
      </div>
    </main>
  )
}

import { getCategories, getArticlesByCategory } from '../../../lib/data'
import Sidebar from '../../../components/Sidebar'
import ArticleCard from '../../../components/ArticleCard'

export async function generateStaticParams() {
  return getCategories().filter(c=> c.slug!=='top' && c.slug!=='latest').map(c => ({ slug: c.slug }))
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cats = getCategories()
  const cat = cats.find(c=>c.slug===params.slug)
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

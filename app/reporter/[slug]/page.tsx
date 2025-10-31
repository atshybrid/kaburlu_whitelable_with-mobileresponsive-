import { getReporters, getReporterBySlug, getArticlesByReporter } from '../../../lib/data'
import ArticleCard from '../../../components/ArticleCard'

export async function generateStaticParams() {
  return getReporters().map(r => ({ slug: r.slug }))
}

export default async function ReporterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const reporter = getReporterBySlug(slug)
  if (!reporter) return <div className="p-4">Not found</div>
  const items = getArticlesByReporter(reporter.slug)
  return (
    <main className="py-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
        <img src={reporter.avatar || 'https://i.pravatar.cc/96'} alt={reporter.name} className="w-16 h-16 rounded-full" />
        <div>
          <h1 className="text-2xl font-extrabold">{reporter.name}</h1>
          {reporter.bio && <p className="text-sm text-gray-600 mt-1">{reporter.bio}</p>}
        </div>
      </div>
      <section className="mt-4 bg-white rounded-lg overflow-hidden border border-gray-200">
        {items.map(a => <ArticleCard key={a.id} a={a} />)}
      </section>
    </main>
  )
}

import Link from 'next/link'
import ShareButton from '../../../components/ShareButton'
import { getArticleBySlug, getAllArticles } from '../../../lib/data'
import { getSiteUrl } from '../../../lib/site'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getArticleBySlug(slug)
  if (!a) return {}
  const site = getSiteUrl()
  const url = site ? `${site}/article/${a.slug}` : `/article/${a.slug}`
  const image = a.hero || a.thumb || '/icons/icon-512.svg'
  return {
    title: a.title,
    description: a.summary,
    alternates: { canonical: url },
    openGraph: {
      title: a.title,
      description: a.summary,
      url,
      type: 'article',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: a.title,
      description: a.summary,
      images: [image]
    }
  }
}

export async function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return <div className="p-4">Not found</div>
  return (
    <main className="py-4">
      <article className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <img src={article.hero || article.thumb || 'https://picsum.photos/seed/hero/1200/800'} alt="" className="w-full h-56 md:h-80 object-cover" />
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">{article.category.name}</span>
            <span>•</span>
            <time>{new Date(article.publishedAt).toLocaleString()}</time>
            <span>•</span>
            <span>{article.readTime} min read</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">{article.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <img src={article.reporter.avatar || 'https://i.pravatar.cc/96'} alt={article.reporter.name} className="w-8 h-8 rounded-full" />
            <div className="text-sm">
              <Link href={`/reporter/${article.reporter.slug}`} className="font-medium hover:underline">{article.reporter.name}</Link>
              <div className="text-gray-500 text-xs">Staff Reporter</div>
            </div>
            <div className="ml-auto">
              <ShareButton title={article.title} slug={article.slug} image={article.hero || article.thumb} className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white" />
            </div>
          </div>
          <div className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
        </div>
      </article>
    </main>
  )
}

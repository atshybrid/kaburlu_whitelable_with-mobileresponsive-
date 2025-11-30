import Link from 'next/link'
import ShareButton from '../../../components/ShareButton'
import AdBanner from '../../../components/AdBanner'
import ArticleCard from '../../../components/ArticleCard'
import ReadingProgress from '../../../components/ReadingProgress'
import StickyShareBar from '../../../components/StickyShareBar'
import JsonLd from '../../../components/JsonLd'
import { getArticleBySlug, getAllArticles, getArticlesByCategory, getTrending } from '../../../lib/data'
import { getSiteUrl, getSiteName } from '../../../lib/site'

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
    keywords: [a.category.name, a.reporter.name, 'news', 'latest'].filter(Boolean),
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
  const siteUrl = getSiteUrl()
  const siteName = getSiteName()
  const relatedAll = getArticlesByCategory(article.category.slug)
  const related = relatedAll.filter(a => a.slug !== article.slug).slice(0, 6)
  const trending = getTrending(5)

  function renderBodyWithInlineAds(html: string) {
    const parts = html.split('</p>')
    const nodes: React.ReactNode[] = []
    for (let i = 0; i < parts.length; i++) {
      const chunk = parts[i]
      if (!chunk.trim()) continue
      nodes.push(<div key={`p-${i}`} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: chunk + '</p>' }} />)
      // Insert an inline ad after the 2nd paragraph (i === 1)
      if (i === 1) {
        nodes.push(
          <div key="inline-ad-1" className="my-6">
            <AdBanner height={250} label="ADVERTISEMENT" />
          </div>
        )
      }
    }
    return nodes
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: [article.hero || article.thumb].filter(Boolean),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { '@type': 'Person', name: article.reporter.name },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: { '@type': 'ImageObject', url: `${siteUrl || ''}/icons/icon-512.svg` }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': siteUrl ? `${siteUrl}/article/${article.slug}` : `/article/${article.slug}`
    }
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl ? `${siteUrl}/` : '/' },
      { '@type': 'ListItem', position: 2, name: article.category.name, item: siteUrl ? `${siteUrl}/category/${article.category.slug}` : `/category/${article.category.slug}` },
      { '@type': 'ListItem', position: 3, name: article.title, item: siteUrl ? `${siteUrl}/article/${article.slug}` : `/article/${article.slug}` },
    ]
  }

  return (
    <main className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 py-4">
      <ReadingProgress />
      <StickyShareBar title={article.title} path={`/article/${article.slug}`} image={article.hero || article.thumb} />
  <JsonLd data={[jsonLd, breadcrumbLd]} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li>›</li>
              <li><Link href={`/category/${article.category.slug}`} className="hover:underline">{article.category.name}</Link></li>
              <li>›</li>
              <li className="text-gray-700 line-clamp-1" aria-current="page">{article.title}</li>
            </ol>
          </nav>
          {/* Article */}
          <article className="bg-white rounded-lg overflow-hidden border border-gray-200">
            {/* Hero image */}
            <img
              src={article.hero || article.thumb || 'https://picsum.photos/seed/hero/1200/800'}
              alt={article.title}
              className="w-full h-56 md:h-80 object-cover"
            />
            <div className="p-4 md:p-6">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {article.category.name}
                </span>
                <span className="hidden sm:inline">•</span>
                <time>{new Date(article.publishedAt).toLocaleString()}</time>
                <span>•</span>
                <span>{article.readTime} min read</span>
                <div className="ml-auto">
                  <ShareButton
                    title={article.title}
                    slug={article.slug}
                    image={article.hero || article.thumb}
                    className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white"
                  />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold mt-2 leading-tight">{article.title}</h1>

              {/* Reporter */}
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={article.reporter.avatar || 'https://i.pravatar.cc/96'}
                  alt={article.reporter.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-sm">
                  <Link href={`/reporter/${article.reporter.slug}`} className="font-medium hover:underline">
                    {article.reporter.name}
                  </Link>
                  <div className="text-gray-500 text-xs">Staff Reporter</div>
                </div>
              </div>

              {/* Top inline ad (beneath header) */}
              <div className="mt-4">
                <AdBanner height={100} label="ADVERTISEMENT" />
              </div>

              {/* Body with inline ads */}
              <div className="mt-4 space-y-4 prose prose-indigo max-w-none">
                {renderBodyWithInlineAds(article.bodyHtml)}
              </div>

              {/* Bottom ad inside article */}
              <div className="mt-6">
                <AdBanner height={250} label="ADVERTISEMENT" />
              </div>
            </div>
          </article>

          {/* Mobile/Tablet inline ad below article */}
          <div className="lg:hidden">
            <AdBanner height={300} label="ADVERTISEMENT" />
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Related {article.category.name} stories</h2>
                <Link href={`/category/${article.category.slug}`} className="text-sm text-indigo-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-px bg-gray-200">
                {related.map(a => (
                  <div key={a.id} className="bg-white">
                    <ArticleCard a={a} compact />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reporter section at bottom */}
          <section className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
            <img
              src={article.reporter.avatar || 'https://i.pravatar.cc/96'}
              alt={article.reporter.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="min-w-0">
              <h3 className="text-xl font-bold truncate">{article.reporter.name}</h3>
              {article.reporter.bio && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.reporter.bio}</p>
              )}
              <div className="mt-2">
                <Link
                  href={`/reporter/${article.reporter.slug}`}
                  className="text-sm px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-gray-700"
                >
                  More from {article.reporter.name}
                </Link>
              </div>
            </div>
          </section>

          {/* Trending rail */}
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Trending across Kaburlu</h2>
              <Link href="/category/top" className="text-sm text-indigo-600 hover:underline">See all</Link>
            </div>
            <ol className="mt-4 space-y-3">
              {trending.map((item, idx) => (
                <li key={item.id} className="flex gap-3">
                  <span className="text-xl font-bold text-gray-200">{idx + 1}</span>
                  <div>
                    <Link href={`/article/${item.slug}`} className="font-semibold leading-tight hover:text-indigo-600">
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{item.category.name} • {item.readTime}m read</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sidebar Ad column */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="sticky top-20 space-y-4">
            <AdBanner height={600} label="ADVERTISEMENT — Sidebar" />
            <AdBanner height={250} label="ADVERTISEMENT" />
          </div>
        </aside>
      </div>
    </main>
  )
}

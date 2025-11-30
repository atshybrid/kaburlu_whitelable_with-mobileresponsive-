import Link from 'next/link'
import AdBanner from '../../../components/AdBanner'
import ShareButton from '../../../components/ShareButton'
import ExternalLink from '../../../components/ExternalLink'
import ReadingProgress from '../../../components/ReadingProgress'
import StickyShareBar from '../../../components/StickyShareBar'
import JsonLd from '../../../components/JsonLd'
import { fetchShortNews, fetchShortNewsItem, normalizeShortNews } from '../../../lib/api'
import { getSiteName, getSiteUrl } from '../../../lib/site'

function toParagraphs(text?: string | null) {
  if (!text) return [] as string[]
  // Split by double newline or sentence-ending punctuation as a fallback
  const parts = text
    .split(/\n\n+/)
    .flatMap(p => p.split(/(?<=[.?!])\s{2,}/))
    .map(p => p.trim())
    .filter(Boolean)
  return parts
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const languageId = process.env.NEXT_PUBLIC_SHORT_NEWS_LANGUAGE_ID
  const { data } = await fetchShortNewsItem({ id, languageId: languageId || undefined })
  if (!data) return {}
  const title = data.seo?.metaTitle || data.title
  const description = data.seo?.metaDescription || data.summary || data.content?.slice(0, 160)
  const image = data.primaryImageUrl || data.seo?.jsonLd?.image?.[0] || '/icons/icon-512.svg'
  const url = `/short/${id}`
  return {
    title,
    description,
    keywords: Array.isArray(data.tags) ? data.tags : undefined,
    alternates: { canonical: data.canonicalUrl || url },
    openGraph: {
      title,
      description,
      url: data.canonicalUrl || url,
      type: 'article',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ShortArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const languageId = process.env.NEXT_PUBLIC_SHORT_NEWS_LANGUAGE_ID
  const { data } = await fetchShortNewsItem({ id, languageId: languageId || undefined })
  if (!data) return <div className="p-4">Not found</div>

  const published = data.publishedAt || data.notifiedAt || null
  const alt = data.seo?.altTexts?.[data.primaryImageUrl || ''] || undefined
  const siteUrl = getSiteUrl()
  const siteName = getSiteName()

  // Fetch related items from the same category
  const res = await fetchShortNews({ limit: 48 })
  const items = normalizeShortNews(res.data)
  const related = items.filter(a => a.id !== id && a.category === data.categoryName).slice(0, 6)

  const paragraphs = toParagraphs(data.content || data.summary)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: data.title,
    description: data.seo?.metaDescription || data.summary || undefined,
    image: [data.primaryImageUrl].filter(Boolean),
    datePublished: published || undefined,
    dateModified: published || undefined,
    author: data.authorName ? { '@type': 'Person', name: data.authorName } : undefined,
    inLanguage: data.languageCode || undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: { '@type': 'ImageObject', url: `${siteUrl || ''}/icons/icon-512.svg` }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': siteUrl ? `${siteUrl}/short/${id}` : `/short/${id}`
    }
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl ? `${siteUrl}/` : '/' },
      ...(data.categoryName ? [{ '@type': 'ListItem', position: 2, name: data.categoryName, item: siteUrl ? `${siteUrl}/` : '/' }] : []),
      { '@type': 'ListItem', position: data.categoryName ? 3 : 2, name: data.title, item: siteUrl ? `${siteUrl}/short/${id}` : `/short/${id}` },
    ]
  }
  const apiJsonLd = (data as any)?.seo?.jsonLd

  return (
    <main className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 py-4">
  <ReadingProgress />
  <StickyShareBar title={data.title} path={`/short/${id}`} image={data.primaryImageUrl || undefined} />
  <JsonLd data={apiJsonLd ? [jsonLd, breadcrumbLd, apiJsonLd] : [jsonLd, breadcrumbLd]} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              {data.categoryName && (<>
                <li>›</li>
                <li className="text-gray-700">{data.categoryName}</li>
              </>)}
              <li>›</li>
              <li className="text-gray-700 line-clamp-1" aria-current="page">{data.title}</li>
            </ol>
          </nav>
          <article className="bg-white rounded-lg overflow-hidden border border-gray-200">
            {/* Hero image */}
            {data.primaryImageUrl ? (
              <img src={data.primaryImageUrl} alt={alt || data.title} className="w-full h-56 md:h-80 object-cover" />
            ) : (
              <div className="w-full h-40 md:h-56 bg-gray-100" />
            )}
            <div className="p-4 md:p-6">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {data.categoryName && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {data.categoryName}
                  </span>
                )}
                {published && <>
                  <span className="hidden sm:inline">•</span>
                  <time>{new Date(published).toLocaleString()}</time>
                </>}
                {data.languageName && <>
                  <span>•</span>
                  <span>{data.languageName}</span>
                </>}
                <div className="ml-auto">
                  <ShareButton title={data.title} slug={id} path={`/short/${id}`} image={data.primaryImageUrl || undefined} className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold mt-2 leading-tight">{data.title}</h1>

              {/* Author */}
              {data.authorName && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="text-sm">
                    <div className="font-medium">{data.authorName}</div>
                    <div className="text-gray-500 text-xs">Contributor</div>
                  </div>
                </div>
              )}

              {/* Top inline ad */}
              <div className="mt-4">
                <AdBanner height={100} label="ADVERTISEMENT" />
              </div>

              {/* Body */}
              <div className="mt-4 space-y-4 prose prose-indigo max-w-none">
                {paragraphs.length ? (
                  paragraphs.map((p, i) => (
                    <div key={i} className="prose max-w-none">
                      <p>{p}</p>
                      {i === 1 && (
                        <div className="my-6">
                          <AdBanner height={250} label="ADVERTISEMENT" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">{data.summary || '—'}</p>
                )}
              </div>

              {/* Bottom ad inside article */}
              <div className="mt-6">
                <AdBanner height={250} label="ADVERTISEMENT" />
              </div>

              {/* Tags */}
              {Array.isArray(data.tags) && data.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {data.tags.map(t => (
                    <span key={t} className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </article>

          {/* Mobile/Tablet inline ad below article */}
          <div className="lg:hidden">
            <AdBanner height={300} label="ADVERTISEMENT" />
          </div>

          {/* Related short news */}
          {related.length > 0 && (
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Related {data.categoryName || 'news'}</h2>
                {data.categoryName && (
                  <ExternalLink href="#" className="text-sm text-indigo-600 hover:underline">View more</ExternalLink>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-px bg-gray-200">
                {related.map(a => (
                  <div key={a.id} className="bg-white p-3 flex gap-3">
                    {a.image ? (
                      <img src={a.image} alt={a.title} className="w-24 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-24 h-16 rounded bg-gray-100" />
                    )}
                    <div className="min-w-0">
                      <ExternalLink href={a.href} className="font-semibold text-sm line-clamp-2 hover:text-indigo-700">{a.title}</ExternalLink>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bottom reporter-like section (author) */}
          {data.authorName && (
            <section className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200" />
              <div className="min-w-0">
                <h3 className="text-xl font-bold truncate">{data.authorName}</h3>
                <div className="text-sm text-gray-600 mt-1">Citizen Reporter</div>
              </div>
            </section>
          )}
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

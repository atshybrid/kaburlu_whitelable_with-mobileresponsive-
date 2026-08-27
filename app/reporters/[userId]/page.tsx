import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getConfig } from '@/lib/config'
import { resolveTenant } from '@/lib/tenant'
import {
  buildReporterPersonJsonLd,
  fetchReporterProfile,
} from '@/lib/reporters'
import { discoverRobots } from '@/lib/metadata'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>
}): Promise<Metadata> {
  const { userId } = await params
  const tenant = await resolveTenant()
  const config = await getConfig()
  const domain = tenant.domain || 'localhost'
  const tenantId = config?.tenant?.id || tenant.id

  const reporter = await fetchReporterProfile(tenantId, userId, domain)
  if (!reporter) {
    return { title: 'Reporter Not Found' }
  }

  const siteName = config?.branding?.siteName || tenant.name
  const protocol = domain.includes('localhost') ? 'http' : 'https'
  const siteUrl = `${protocol}://${domain}`

  return {
    title: `${reporter.name} — ${siteName}`,
    description:
      reporter.bio ||
      `${reporter.name} is a reporter at ${siteName}. Read their latest articles.`,
    robots: discoverRobots,
    alternates: {
      canonical: `${siteUrl}/reporters/${userId}`,
    },
  }
}

export default async function ReporterProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const tenant = await resolveTenant()
  const config = await getConfig()
  const domain = tenant.domain || 'localhost'
  const tenantId = config?.tenant?.id || tenant.id
  const siteName = config?.branding?.siteName || tenant.name

  const protocol = domain.includes('localhost') ? 'http' : 'https'
  const siteUrl = `${protocol}://${domain}`

  const reporter = await fetchReporterProfile(tenantId, userId, domain)
  if (!reporter) notFound()

  const personJsonLd = buildReporterPersonJsonLd(reporter, siteUrl, siteName)

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <article>
        <header className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {reporter.photoUrl ? (
            <img
              src={reporter.photoUrl}
              alt={reporter.name}
              width={120}
              height={120}
              className="rounded-full object-cover w-[120px] h-[120px]"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{reporter.name}</h1>
            {reporter.designation ? (
              <p className="text-zinc-600 mt-1">{reporter.designation}</p>
            ) : null}
            {reporter.location?.district || reporter.location?.state ? (
              <p className="text-sm text-zinc-500 mt-1">
                {[reporter.location.district, reporter.location.state].filter(Boolean).join(', ')}
              </p>
            ) : null}
            {(reporter.totalArticles ?? 0) > 0 && (
              <p className="text-sm text-zinc-500 mt-2">
                {reporter.totalArticles} articles · {reporter.totalViews ?? 0} views
              </p>
            )}
          </div>
        </header>

        {reporter.bio ? (
          <p className="text-zinc-700 leading-relaxed mb-8">{reporter.bio}</p>
        ) : null}

        {reporter.recentArticles && reporter.recentArticles.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold mb-4">Recent Articles</h2>
            <ul className="space-y-4">
              {reporter.recentArticles.map((item) => {
                const cat = item.category?.slug || 'news'
                const href = `/${encodeURIComponent(cat)}/${encodeURIComponent(item.slug)}`
                return (
                  <li key={item.id} className="border-b border-zinc-100 pb-4">
                    <Link href={href} className="font-medium text-zinc-900 hover:underline">
                      {item.title}
                    </Link>
                    {item.publishedAt ? (
                      <time className="block text-sm text-zinc-500 mt-1" dateTime={item.publishedAt}>
                        {new Date(item.publishedAt).toLocaleDateString('te-IN')}
                      </time>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  )
}

import Link from 'next/link'
import type { UrlObject } from 'url'
import { Footer } from '@/components/shared/Footer'
import { LiveTvEmbed } from '@/components/shared/LiveTvEmbed'
import { Navbar } from '@/components/shared/Navbar'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import { articleHref } from '@/lib/url'
import { PlaceholderImg } from '@/components/shared/PlaceholderImg'
import { FlashTicker } from '@/components/shared/FlashTicker'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

function HeroLead({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group relative h-[420px] w-full overflow-hidden rounded-xl">
      {a.coverImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      ) : (
        <PlaceholderImg className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <Link
          href={toHref(articleHref(tenantSlug, a.slug || a.id))}
          className="block text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md"
        >
          {a.title}
        </Link>
      </div>
    </article>
  )
}

function CardMedium({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group relative h-60 overflow-hidden rounded-lg border bg-white">
      {a.coverImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
      ) : (
        <PlaceholderImg className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
      <Link
        href={toHref(articleHref(tenantSlug, a.slug || a.id))}
        className="absolute inset-x-0 bottom-0 p-4 text-lg font-bold leading-snug text-white"
      >
        {a.title}
      </Link>
    </article>
  )
}

function CardSmall({ tenantSlug, a }: { tenantSlug: string; a: Article }) {
  return (
    <article className="group flex gap-3 rounded-md border bg-white p-3 hover:shadow-sm transition-shadow">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md">
        {a.coverImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImg className="h-full w-full object-cover" />
        )}
      </div>
      <Link
        href={toHref(articleHref(tenantSlug, a.slug || a.id))}
        className="line-clamp-3 text-sm font-semibold leading-tight hover:text-red-600"
      >
        {a.title}
      </Link>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border bg-white shadow-sm">
      <div className="border-b bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
        {title}
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </section>
  )
}

export function ThemeHome({ tenantSlug, title, articles, settings }: { tenantSlug: string; title: string; articles: Article[]; settings?: EffectiveSettings }) {
  const lead = articles[0]
  const medium = articles.slice(1, 3)
  const small = articles.slice(3, 9)
  const more = articles.slice(9, 21)

  return (
    <div className="theme-tv9">
      <Navbar tenantSlug={tenantSlug} title={title} logoUrl={settings?.branding?.logoUrl} />

      {/* Flash News strip */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <FlashTicker tenantSlug={tenantSlug} items={articles.slice(0, 12)} />
        </div>
      </div>

      {/* Top banner ad placeholder */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="my-3 h-24 w-full rounded-md border bg-gray-50 text-center text-sm leading-[6rem] text-gray-500">Ad banner</div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {lead && <HeroLead tenantSlug={tenantSlug} a={lead} />}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {medium.map((a) => (
                <CardMedium key={a.id} tenantSlug={tenantSlug} a={a} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Section title="Live TV">
              <LiveTvEmbed />
            </Section>
            <div className="rounded-xl border bg-white p-4 text-center text-sm text-gray-500">Ad widget</div>
          </div>
        </div>
        {/* Secondary grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {small.map((a) => (
            <CardSmall key={a.id} tenantSlug={tenantSlug} a={a} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title="Trending Videos">
            <div className="space-y-4">
              {more.slice(0, 6).map((a) => (
                <CardSmall key={a.id} tenantSlug={tenantSlug} a={a} />
              ))}
            </div>
          </Section>
          <Section title="Trending Photos">
            <div className="grid grid-cols-2 gap-4">
              {more.slice(6, 12).map((a) => (
                <div key={a.id} className="group relative h-32 overflow-hidden rounded-lg">
                  {a.coverImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.coverImage.url} alt={a.title} className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  ) : (
                    <PlaceholderImg className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Link
                    href={toHref(articleHref(tenantSlug, a.slug || a.id))}
                    className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs font-semibold text-white"
                  >
                    {a.title}
                  </Link>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export function ThemeArticle({ tenantSlug, title, article }: { tenantSlug: string; title: string; article: Article }) {
  return (
    <div className="theme-tv9">
      <Navbar tenantSlug={tenantSlug} title={title} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {article.coverImage?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage.url} alt={article.title} className="mb-4 rounded-md" />
        )}
        <h1 className="mb-2 text-3xl font-extrabold leading-tight">{article.title}</h1>
        <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content ?? '' }} />
      </main>
      <Footer />
    </div>
  )
}

// Keyframes for simple marquee effect
// Using global style via a small CSS file in this theme
import Link from 'next/link'
import { getEffectiveSettings } from '@/lib/settings'
import type { EffectiveSettings } from '@/lib/remote'
import { basePathForTenant, homeHref } from '@/lib/url'

function safeUrl(v: string | undefined) {
  const s = String(v || '').trim()
  return s || undefined
}

function firstNonEmpty(...vals: Array<string | undefined | null>) {
  for (const v of vals) {
    const s = String(v || '').trim()
    if (s) return s
  }
  return ''
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, '')
}

export async function Footer({ settings, tenantSlug }: { settings?: EffectiveSettings; tenantSlug?: string }) {
  const year = new Date().getFullYear()

  const effective = settings ?? (await getEffectiveSettings().catch(() => ({} as EffectiveSettings)))

  const canonicalBaseUrl = firstNonEmpty(effective.seo?.canonicalBaseUrl, effective.settings?.seo?.canonicalBaseUrl)
  const siteUrl = stripTrailingSlash(firstNonEmpty(canonicalBaseUrl, process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000'))
  const siteName = firstNonEmpty(effective.branding?.siteName, effective.settings?.branding?.siteName, 'Kaburlu News')
  const logoUrl = safeUrl(firstNonEmpty(effective.branding?.logoUrl, effective.settings?.branding?.logoUrl))

  const contactEmail = firstNonEmpty(effective.contact?.email, effective.settings?.contact?.email, process.env.NEXT_PUBLIC_CONTACT_EMAIL, '')
  const contactPhone = firstNonEmpty(effective.contact?.phone, effective.settings?.contact?.phone, process.env.NEXT_PUBLIC_CONTACT_PHONE, '')
  const addressLocality = firstNonEmpty(effective.contact?.city, effective.settings?.contact?.city, process.env.NEXT_PUBLIC_CONTACT_CITY, 'Hyderabad')
  const addressRegion = firstNonEmpty(effective.contact?.region, effective.settings?.contact?.region, process.env.NEXT_PUBLIC_CONTACT_REGION, 'Telangana')
  const addressCountry = firstNonEmpty(effective.contact?.country, effective.settings?.contact?.country, process.env.NEXT_PUBLIC_CONTACT_COUNTRY, 'IN')

  const facebook = safeUrl(firstNonEmpty(effective.social?.facebook, effective.settings?.social?.facebook, process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK))
  const x = safeUrl(firstNonEmpty(effective.social?.x, effective.settings?.social?.x, process.env.NEXT_PUBLIC_SOCIAL_X))
  const instagram = safeUrl(firstNonEmpty(effective.social?.instagram, effective.settings?.social?.instagram, process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM))
  const youtube = safeUrl(firstNonEmpty(effective.social?.youtube, effective.settings?.social?.youtube, process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE))
  const telegram = safeUrl(firstNonEmpty(effective.social?.telegram, effective.settings?.social?.telegram, process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM))

  const sameAs = [facebook, x, instagram, youtube, telegram].filter(Boolean) as string[]

  const basePath = tenantSlug ? basePathForTenant(tenantSlug) : ''
  function hrefForTenant(pathname: string) {
    const p = String(pathname || '')
    if (!p) return ''
    if (p.startsWith('http://') || p.startsWith('https://')) return p
    if (!p.startsWith('/')) return p
    if (p === '/') return tenantSlug ? homeHref(tenantSlug) : '/'
    if (!basePath) return p
    if (p === basePath || p.startsWith(`${basePath}/`)) return p
    return `${basePath}${p}`
  }

  const orgId = `${siteUrl}#organization`
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      '@id': orgId,
      name: siteName,
      url: siteUrl,
      ...(logoUrl ? { logo: { '@type': 'ImageObject', url: logoUrl } } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      ...(contactEmail || contactPhone
        ? {
            contactPoint: [
              {
                '@type': 'ContactPoint',
                ...(contactEmail ? { email: contactEmail } : {}),
                ...(contactPhone ? { telephone: contactPhone } : {}),
                contactType: 'customer support',
                availableLanguage: ['en', 'te'],
              },
            ],
          }
        : {}),
      address: {
        '@type': 'PostalAddress',
        addressLocality,
        addressRegion,
        addressCountry,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      publisher: { '@id': orgId },
    },
  ]

  return (
    <footer className="mt-8 bg-zinc-900 text-zinc-300" itemScope itemType="https://schema.org/WPFooter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-lg font-bold text-white">📰 Stay Updated</h3>
              <p className="text-sm text-blue-100">Get breaking news and top stories delivered to your inbox.</p>
            </div>
            <form className="flex w-full max-w-md gap-2" action={contactEmail ? `mailto:${contactEmail}` : '#'} method="post">
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-md border-0 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-blue-200 outline-none focus:ring-2 focus:ring-white backdrop-blur"
              />
              <button type="submit" className="shrink-0 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="border-t border-zinc-800">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 text-sm md:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="inline-block h-6 w-1 rounded bg-blue-600" />
              <span className="text-xl font-extrabold text-white">{siteName}</span>
            </div>
            <p className="leading-relaxed text-zinc-400 text-[13px]">
              Your trusted source for breaking news, in-depth coverage, and latest updates.
            </p>
            <address className="not-italic space-y-1 text-zinc-500 text-[13px]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {addressLocality}, {addressRegion}, {addressCountry}
              </div>
              {contactEmail ? (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {contactEmail}
                </a>
              ) : null}
              {contactPhone ? (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {contactPhone}
                </a>
              ) : null}
            </address>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <nav aria-label="Quick links">
              <ul className="space-y-2.5 text-zinc-400">
                <li>
                  <Link className="hover:text-white transition-colors text-[13px]" href={{ pathname: hrefForTenant('/') || '/' }}>
                    Home
                  </Link>
                </li>
                <li>
                  <a className="hover:text-white transition-colors text-[13px]" href={hrefForTenant('/sitemap.xml') || '/sitemap.xml'}>
                    Sitemap
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors text-[13px]" href={hrefForTenant('/robots.txt') || '/robots.txt'}>
                    Robots.txt
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Legal</h4>
            <nav aria-label="Legal links">
              <ul className="space-y-2.5 text-zinc-400">
                <li>
                  <a className="hover:text-white transition-colors text-[13px]" href={hrefForTenant('/about-us') || '/about-us'}>
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors text-[13px]" href={hrefForTenant('/privacy-policy') || '/privacy-policy'}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors text-[13px]" href={hrefForTenant('/terms') || '/terms'}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors text-[13px]" href={hrefForTenant('/disclaimer') || '/disclaimer'}>
                    Disclaimer
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors text-[13px]" href={hrefForTenant('/contact-us') || (contactEmail ? `mailto:${contactEmail}` : '#')}>
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Social & Follow */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">Follow Us</h4>
            <div className="flex flex-wrap gap-2">
              {facebook ? (
                <a
                  aria-label="Follow us on Facebook"
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.76l-.44 2.9h-2.32V22c4.78-.76 8.44-4.92 8.44-9.94Z"/></svg>
                </a>
              ) : null}
              {x ? (
                <a
                  aria-label="Follow us on X"
                  href={x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-black hover:text-white transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 3h3.7l5.2 7.51L17.6 3H21l-7.46 10.5L21.5 21H17.8l-5.5-7.86L6.4 21H3l7.87-10.93L3 3Z"/></svg>
                </a>
              ) : null}
              {youtube ? (
                <a
                  aria-label="Subscribe on YouTube"
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-red-600 hover:text-white transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M23.5 6.2s-.23-1.64-.94-2.36c-.9-.94-1.9-.95-2.36-1C16.9 2.5 12 2.5 12 2.5h-.01s-4.9 0-8.19.34c-.46.05-1.46.06-2.36 1-.71.72-.94 2.36-.94 2.36S0 8.2 0 10.2v1.6c0 2 .1 4 .1 4s.23 1.64.94 2.36c.9.94 2.08.91 2.61 1.01 1.9.18 8.35.24 8.35.24s4.9 0 8.19-.34c.46-.05 1.46-.06 2.36-1 .71-.72.94-2.36.94-2.36s.1-2 .1-4v-1.6c0-2-.1-4-.1-4ZM9.6 13.6V7.9l6.15 2.85-6.15 2.85Z"/></svg>
                </a>
              ) : null}
              {instagram ? (
                <a
                  aria-label="Follow us on Instagram"
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.06 2 .26 2.47.44.62.24 1.07.52 1.54.98.47.47.74.92.98 1.54.18.47.38 1.27.44 2.47.07 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.06 1.2-.26 2-.44 2.47a4.1 4.1 0 0 1-.98 1.54 4.1 4.1 0 0 1-1.54.98c-.47.18-1.27.38-2.47.44-1.2.07-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.06-2-.26-2.47-.44a4.1 4.1 0 0 1-1.54-.98 4.1 4.1 0 0 1-.98-1.54c-.18-.47-.38-1.27-.44-2.47C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.06-1.2.26-2 .44-2.47.24-.62.52-1.07.98-1.54.47-.47.92-.74 1.54-.98.47-.18 1.27-.38 2.47-.44C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.16 0-3.53 0-4.78.07-.98.05-1.5.21-1.85.35-.47.18-.8.38-1.14.72-.34.34-.54.67-.72 1.14-.14.35-.3.87-.35 1.85-.07 1.25-.07 1.62-.07 4.78s0 3.53.07 4.78c.05.98.21 1.5.35 1.85.18.47.38.8.72 1.14.34.34.67.54 1.14.72.35.14.87.3 1.85.35 1.25.07 1.62.07 4.78.07s3.53 0 4.78-.07c.98-.05 1.5-.21 1.85-.35.47-.18.8-.38 1.14-.72.34-.34.54-.67.72-1.14.14-.35.3-.87.35-1.85.07-1.25.07-1.62.07-4.78s0-3.53-.07-4.78c-.05-.98-.21-1.5-.35-1.85a2.3 2.3 0 0 0-.72-1.14 2.3 2.3 0 0 0-1.14-.72c-.35-.14-.87-.3-1.85-.35-1.25-.07-1.62-.07-4.78-.07Zm0 3.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 1.8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.46-2.26a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24Z"/></svg>
                </a>
              ) : null}
              {telegram ? (
                <a
                  aria-label="Join us on Telegram"
                  href={telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-sky-500 hover:text-white transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M9.03 15.3 8.7 19c.47 0 .67-.21.92-.47l2.21-2.1 4.58 3.36c.84.47 1.45.22 1.68-.77l3.05-14.32c.27-1.24-.45-1.72-1.26-1.42L2.1 9.3c-1.2.47-1.18 1.14-.2 1.45l5.34 1.66 12.38-7.81c.58-.36 1.1-.16.67.23L9.03 15.3Z"/></svg>
                </a>
              ) : null}
            </div>
            <p className="mt-4 text-[12px] text-zinc-500">
              Follow us for real-time updates
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-[12px] text-zinc-500 md:flex-row md:text-left">
          <div>© {year} {siteName}. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <a href="https://kaburlu.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
              Kaburlu Softwares
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

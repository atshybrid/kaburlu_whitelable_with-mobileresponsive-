import Link from 'next/link'
import { getEffectiveSettings } from '@/lib/settings'
import type { EffectiveSettings } from '@/lib/remote'
import { basePathForTenant, homeHref } from '@/lib/url'
import { getDomainStats } from '@/lib/domain-stats'
import { getTenantDomain } from '@/lib/domain-utils'

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

/**
 * Check if a color is dark (needs white text)
 * Supports both hex (#RRGGBB, #RGB) and HSL (H S% L%) formats
 * Uses luminance formula for hex: 0.299*R + 0.587*G + 0.114*B
 * For HSL: if lightness < 50%, color is dark
 */
function isColorDark(color: string | undefined): boolean {
  if (!color) return false
  const trimmed = color.trim()
  
  // Check if it's HSL format (e.g., "240 100% 50%" or "240, 100%, 50%")
  const hslMatch = trimmed.match(/^(\d+)\s*[,\s]\s*(\d+)%?\s*[,\s]\s*(\d+)%?$/)
  if (hslMatch) {
    const lightness = parseInt(hslMatch[3], 10)
    // If lightness < 50%, color is dark
    return lightness < 50
  }
  
  // Handle hex format
  const hex = trimmed.replace('#', '')
  if (hex.length !== 6 && hex.length !== 3) return false
  
  const fullHex = hex.length === 3 
    ? hex.split('').map(c => c + c).join('') 
    : hex
  
  const r = parseInt(fullHex.slice(0, 2), 16)
  const g = parseInt(fullHex.slice(2, 4), 16)
  const b = parseInt(fullHex.slice(4, 6), 16)
  
  // Luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // If luminance < 0.5, color is dark
  return luminance < 0.5
}

export async function Footer({ settings, tenantSlug }: { settings?: EffectiveSettings; tenantSlug?: string }) {
  const year = new Date().getFullYear()

  const effective = settings ?? (await getEffectiveSettings().catch(() => ({} as EffectiveSettings)))

  const canonicalBaseUrl = firstNonEmpty(effective.seo?.canonicalBaseUrl, effective.settings?.seo?.canonicalBaseUrl)
  const siteUrl = stripTrailingSlash(firstNonEmpty(canonicalBaseUrl, process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000'))
  
  // ✅ Use actual tenant domain from proxy/middleware, NOT canonicalBaseUrl
  // canonicalBaseUrl might have wrong domain in backend config
  const domain = await getTenantDomain()
  
  console.log(`📊 [FOOTER] canonicalBaseUrl: ${canonicalBaseUrl} → domain for stats: ${domain}`)

  // Fetch domain stats - completely optional, don't block rendering
  let domainStats: Awaited<ReturnType<typeof getDomainStats>> = null
  try {
    domainStats = await Promise.race([
      getDomainStats(domain),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)) // 2s timeout
    ])
    console.log(`📊 [FOOTER] Domain stats result:`, domainStats ? {
      totalViews: domainStats.stats?.totalViews,
      totalReporters: domainStats.stats?.totalReporters
    } : 'null/timeout')
  } catch (error) {
    console.error('Failed to fetch domain stats:', error)
    domainStats = null
  }

  // Helper to safely get stats values with fallback
  const viewCount = domainStats?.stats?.totalViews ?? 0
  const reporterCount = domainStats?.stats?.totalReporters ?? 0

  const siteName = firstNonEmpty(effective.branding?.siteName, effective.settings?.branding?.siteName, 'Kaburlu News')
  const logoUrl = safeUrl(firstNonEmpty(effective.branding?.logoUrl, effective.settings?.branding?.logoUrl))

  const contactEmail = firstNonEmpty(effective.contact?.email, effective.settings?.contact?.email, process.env.NEXT_PUBLIC_CONTACT_EMAIL, '')
  const contactPhone = firstNonEmpty(effective.contact?.phone, effective.settings?.contact?.phone, process.env.NEXT_PUBLIC_CONTACT_PHONE, '')
  const addressLocality = firstNonEmpty(effective.contact?.city, effective.settings?.contact?.city, process.env.NEXT_PUBLIC_CONTACT_CITY, 'Hyderabad')
  const addressRegion = firstNonEmpty(effective.contact?.region, effective.settings?.contact?.region, process.env.NEXT_PUBLIC_CONTACT_REGION, 'Telangana')
  const addressCountry = firstNonEmpty(effective.contact?.country, effective.settings?.contact?.country, process.env.NEXT_PUBLIC_CONTACT_COUNTRY, 'IN')

  const facebook = safeUrl(firstNonEmpty(effective.social?.facebook, effective.settings?.social?.facebook, process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK))
  const x = safeUrl(firstNonEmpty(effective.social?.x, effective.social?.twitter, effective.settings?.social?.x, effective.settings?.social?.twitter, process.env.NEXT_PUBLIC_SOCIAL_X))
  const instagram = safeUrl(firstNonEmpty(effective.social?.instagram, effective.settings?.social?.instagram, process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM))
  const youtube = safeUrl(firstNonEmpty(effective.social?.youtube, effective.settings?.social?.youtube, process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE))
  const telegram = safeUrl(firstNonEmpty(effective.social?.telegram, effective.settings?.social?.telegram, process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM))

  // Get primary color for newsletter section text color logic
  const primaryColor = firstNonEmpty(
    effective.theme?.colors?.primary,
    effective.settings?.theme?.colors?.primary
  )
  const isDarkPrimary = isColorDark(primaryColor)
  
  // Text colors for newsletter section based on primary color brightness
  const newsletterTextColor = isDarkPrimary ? 'text-white' : 'text-black'
  const newsletterTextMuted = isDarkPrimary ? 'text-white/80' : 'text-black/80'
  const newsletterTextSubtle = isDarkPrimary ? 'text-white/70' : 'text-black/70'

  // Get footer sections from navigation config
  const footerSections = (effective.navigation?.footer as any)?.sections || []
  const copyrightText = (effective.navigation?.footer as any)?.copyrightText || `© ${year} ${siteName}. All rights reserved.`
  
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
    <footer className="mt-8 bg-white text-black border-t border-zinc-200" itemScope itemType="https://schema.org/WPFooter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Top Banner - Download App / Breaking News Alert - Uses Primary Color */}
      <div className="bg-[hsl(var(--primary))]">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🔴</span>
              <div>
                <span className={`text-sm font-bold ${newsletterTextColor}`}>బ్రేకింగ్ న్యూస్ అలర్ట్స్ పొందండి!</span>
                <span className={`hidden sm:inline text-sm ${newsletterTextSubtle} ml-2`}>• వెంటనే తెలుసుకోండి</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="#" className={`px-4 py-1.5 rounded-full ${isDarkPrimary ? 'bg-white text-[hsl(var(--primary))]' : 'bg-black text-white'} text-xs font-bold hover:opacity-80 transition-colors`}>
                📱 యాప్ డౌన్‌లోడ్
              </a>
              <a href={telegram || '#'} className={`px-4 py-1.5 rounded-full ${isDarkPrimary ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-black/10 text-black hover:bg-black/20'} text-xs font-bold transition-colors`}>
                టెలిగ్రామ్ జాయిన్
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section - Uses Primary Color with Smart Text Colors */}
      <div className="relative overflow-hidden bg-[hsl(var(--primary))]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <span className="text-3xl">📰</span>
                <h3 className={`text-2xl font-bold ${newsletterTextColor}`}>తాజా వార్తలను మిస్ అవ్వకండి!</h3>
              </div>
              <p className={newsletterTextMuted}>
                రోజూ ఉదయం మీ ఇన్‌బాక్స్‌లో బ్రేకింగ్ న్యూస్, ట్రెండింగ్ స్టోరీలు మరియు ఎక్స్‌క్లూజివ్ కంటెంట్ పొందండి.
              </p>
              <div className={`flex items-center justify-center lg:justify-start gap-4 mt-3 text-sm ${newsletterTextSubtle}`}>
                <span className="flex items-center gap-1"><span>✓</span> ఉచితం</span>
                <span className="flex items-center gap-1"><span>✓</span> స్పామ్ లేదు</span>
                <span className="flex items-center gap-1"><span>✓</span> ఎప్పుడైనా అన్‌సబ్‌స్క్రైబ్</span>
              </div>
            </div>
            <form className="flex flex-col sm:flex-row w-full max-w-md gap-3" action={contactEmail ? `mailto:${contactEmail}` : '#'} method="post">
              <input
                type="email"
                name="email"
                required
                placeholder="మీ ఇమెయిల్ నమోదు చేయండి"
                className="flex-1 rounded-xl border-2 border-zinc-300 bg-white px-5 py-3.5 text-sm text-black placeholder:text-zinc-500 outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
              />
              <button type="submit" className="shrink-0 rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white hover:bg-zinc-800 hover:scale-105 transition-all shadow-lg">
                🚀 సబ్‌స్క్రైబ్ చేయండి
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Grid - 5 Columns */}
      <div className="border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
            
            {/* Brand Section */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-5">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center">
                      <span className="text-white text-xl font-bold">{siteName.charAt(0)}</span>
                    </div>
                    <span className="text-xl font-extrabold text-black">{siteName}</span>
                  </div>
                )}
              </div>
              <p className="leading-relaxed text-zinc-600 text-sm">
                తెలుగు వార్తా ప్రపంచంలో నమ్మదగిన పేరు. బ్రేకింగ్ న్యూస్, లోతైన విశ్లేషణ మరియు నిష్పక్షపాత కవరేజ్ కోసం మీ ఏకైక గమ్యస్థానం.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                  <div className="text-lg font-bold text-[hsl(var(--primary))]">
                    {viewCount > 0 ? viewCount.toLocaleString('en-IN') : '10L+'}
                  </div>
                  <div className="text-[10px] text-zinc-600">పాఠకులు</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                  <div className="text-lg font-bold text-[hsl(var(--primary))]">24/7</div>
                  <div className="text-[10px] text-zinc-600">వార్తలు</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-zinc-100 border border-zinc-200">
                  <div className="text-lg font-bold text-[hsl(var(--primary))]">
                    {reporterCount > 0 ? `${reporterCount}+` : '100+'}
                  </div>
                  <div className="text-[10px] text-zinc-600">రిపోర్టర్లు</div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[hsl(var(--primary))]" />
                కేటగిరీలు
              </h4>
              <nav aria-label="Categories">
                <ul className="space-y-2.5 text-zinc-600">
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/category/national')}>జాతీయం</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/category/international')}>అంతర్జాతీయం</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/category/politics')}>రాజకీయాలు</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/category/sports')}>క్రీడలు</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/category/entertainment')}>వినోదం</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/category/business')}>వ్యాపారం</a></li>
                </ul>
              </nav>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[hsl(var(--primary))]" />
                త్వరిత లింక్‌లు
              </h4>
              <nav aria-label="Quick links">
                <ul className="space-y-2.5 text-zinc-600">
                  <li>
                    <Link className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={{ pathname: hrefForTenant('/') || '/' }}>
                      🏠 హోమ్ పేజీ
                    </Link>
                  </li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/trending')}>🔥 ట్రెండింగ్</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/videos')}>🎬 వీడియోలు</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/photos')}>📷 ఫోటోలు</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/web-stories')}>📱 వెబ్ స్టోరీస్</a></li>
                  <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/live-tv')}>📺 లైవ్ టీవీ</a></li>
                </ul>
              </nav>
            </div>

            {/* Legal Links - From Config */}
            {footerSections.length > 0 ? (
              footerSections.map((section: any, idx: number) => (
                <div key={idx}>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-[hsl(var(--primary))]" />
                    {section.title}
                  </h4>
                  <nav aria-label={section.title}>
                    <ul className="space-y-2.5 text-zinc-600">
                      {section.links?.map((link: any, linkIdx: number) => (
                        <li key={linkIdx}>
                          <a 
                            className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" 
                            href={hrefForTenant(link.href)}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              ))
            ) : (
              <div>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-[hsl(var(--primary))]" />
                  చట్టపరమైన
                </h4>
                <nav aria-label="Legal links">
                  <ul className="space-y-2.5 text-zinc-600">
                    <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/about-us')}>మా గురించి</a></li>
                    <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/privacy-policy')}>గోప్యతా విధానం</a></li>
                    <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/terms')}>సేవా నిబంధనలు</a></li>
                    <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/disclaimer')}>నిరాకరణ</a></li>
                    <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/advertise')}>ప్రకటనలు ఇవ్వండి</a></li>
                    <li><a className="hover:text-[hsl(var(--primary))] hover:translate-x-1 inline-block transition-all text-sm" href={hrefForTenant('/contact-us')}>మమ్మల్ని సంప్రదించండి</a></li>
                  </ul>
                </nav>
              </div>
            )}

            {/* Contact & Social */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[hsl(var(--primary))]" />
                సంప్రదించండి
              </h4>
              
              <address className="not-italic space-y-3 text-sm">
                <div className="flex items-start gap-3 text-zinc-600">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[hsl(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>{addressLocality}, {addressRegion}, {addressCountry}</span>
                </div>
                
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`} className="flex items-start gap-3 text-zinc-600 hover:text-[hsl(var(--primary))] transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 group-hover:bg-[hsl(var(--primary))] group-hover:border-transparent flex items-center justify-center shrink-0 transition-colors">
                      <svg className="w-4 h-4 text-[hsl(var(--primary))] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="break-all">{contactEmail}</span>
                  </a>
                ) : null}
                
                {contactPhone ? (
                  <a href={`tel:${contactPhone}`} className="flex items-start gap-3 text-zinc-600 hover:text-[hsl(var(--primary))] transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 group-hover:bg-[hsl(var(--primary))] group-hover:border-transparent flex items-center justify-center shrink-0 transition-colors">
                      <svg className="w-4 h-4 text-[hsl(var(--primary))] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span>{contactPhone}</span>
                  </a>
                ) : null}
              </address>

              {/* Social Icons */}
              <div className="mt-5">
                <p className="text-xs text-zinc-500 mb-3">మమ్మల్ని ఫాలో అవ్వండి</p>
                <div className="flex flex-wrap gap-2">
                  {facebook ? (
                    <a aria-label="Facebook" href={facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all hover:scale-110">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.76l-.44 2.9h-2.32V22c4.78-.76 8.44-4.92 8.44-9.94Z"/></svg>
                    </a>
                  ) : null}
                  {x ? (
                    <a aria-label="X" href={x} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-black hover:border-black hover:text-white transition-all hover:scale-110">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 3h3.7l5.2 7.51L17.6 3H21l-7.46 10.5L21.5 21H17.8l-5.5-7.86L6.4 21H3l7.87-10.93L3 3Z"/></svg>
                    </a>
                  ) : null}
                  {youtube ? (
                    <a aria-label="YouTube" href={youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all hover:scale-110">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.5 6.2s-.23-1.64-.94-2.36c-.9-.94-1.9-.95-2.36-1C16.9 2.5 12 2.5 12 2.5h-.01s-4.9 0-8.19.34c-.46.05-1.46.06-2.36 1-.71.72-.94 2.36-.94 2.36S0 8.2 0 10.2v1.6c0 2 .1 4 .1 4s.23 1.64.94 2.36c.9.94 2.08.91 2.61 1.01 1.9.18 8.35.24 8.35.24s4.9 0 8.19-.34c.46-.05 1.46-.06 2.36-1 .71-.72.94-2.36.94-2.36s.1-2 .1-4v-1.6c0-2-.1-4-.1-4ZM9.6 13.6V7.9l6.15 2.85-6.15 2.85Z"/></svg>
                    </a>
                  ) : null}
                  {instagram ? (
                    <a aria-label="Instagram" href={instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:border-purple-600 hover:text-white transition-all hover:scale-110">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.06 2 .26 2.47.44.62.24 1.07.52 1.54.98.47.47.74.92.98 1.54.18.47.38 1.27.44 2.47.07 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.06 1.2-.26 2-.44 2.47a4.1 4.1 0 0 1-.98 1.54 4.1 4.1 0 0 1-1.54.98c-.47.18-1.27.38-2.47.44-1.2.07-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.06-2-.26-2.47-.44a4.1 4.1 0 0 1-1.54-.98 4.1 4.1 0 0 1-.98-1.54c-.18-.47-.38-1.27-.44-2.47C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.06-1.2.26-2 .44-2.47.24-.62.52-1.07.98-1.54.47-.47.92-.74 1.54-.98.47-.18 1.27-.38 2.47-.44C8.4 2.2 8.8 2.2 12 2.2Z"/></svg>
                    </a>
                  ) : null}
                  {telegram ? (
                    <a aria-label="Telegram" href={telegram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-sky-500 hover:border-sky-500 hover:text-white transition-all hover:scale-110">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9.03 15.3 8.7 19c.47 0 .67-.21.92-.47l2.21-2.1 4.58 3.36c.84.47 1.45.22 1.68-.77l3.05-14.32c.27-1.24-.45-1.72-1.26-1.42L2.1 9.3c-1.2.47-1.18 1.14-.2 1.45l5.34 1.66 12.38-7.81c.58-.36 1.1-.16.67.23L9.03 15.3Z"/></svg>
                    </a>
                  ) : null}
                  <a aria-label="WhatsApp" href={`https://wa.me/?text=Check out ${siteName}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-green-600 hover:border-green-600 hover:text-white transition-all hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            {/* Copyright */}
            <div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-4 text-center lg:text-left">
              <span className="text-sm text-zinc-600">
                {copyrightText}
              </span>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <a href={hrefForTenant('/sitemap.xml')} className="hover:text-[hsl(var(--primary))] transition-colors">Sitemap</a>
                <span>•</span>
                <a href={hrefForTenant('/robots.txt')} className="hover:text-[hsl(var(--primary))] transition-colors">Robots.txt</a>
                <span>•</span>
                <a href={hrefForTenant('/rss')} className="hover:text-[hsl(var(--primary))] transition-colors">RSS Feed</a>
              </div>
            </div>
            
            {/* Powered By */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">పవర్డ్ బై</span>
              <a href="https://kaburlumedia.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 hover:border-[hsl(var(--primary))]/50 transition-all">
                <div className="w-6 h-6 rounded bg-[hsl(var(--primary))] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">K</span>
                </div>
                <span className="text-sm font-semibold text-[hsl(var(--primary))] group-hover:opacity-80 transition-all">
                  Kaburlu Media
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

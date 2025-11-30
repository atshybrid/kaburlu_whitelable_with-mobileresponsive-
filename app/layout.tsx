import './globals.css'
import HeaderDisha from '../components/HeaderDisha'
import BottomNav from '../components/BottomNav'
import PWAInstallPrompt from '../components/PWAInstallPrompt'
import JsonLd from '../components/JsonLd'
import SeoFooter from '../components/SeoFooter'
import { getSiteName, getSiteUrl } from '../lib/site'
import { getDomainSettings } from '../lib/tenantApi'
import { headers } from 'next/headers'

export async function generateMetadata() {
  // Fetch domain settings server-side to apply SEO and icons
  // Extract request host to inform tenant resolution
  const hdrs = await headers()
  const reqHost = hdrs.get('x-forwarded-host') || hdrs.get('host') || undefined
  // Fetch domain settings server-side to apply SEO and icons (host-aware)
  const settings = await getDomainSettings({ revalidate: 60, timeoutMs: 4000, previewTenantDomain: reqHost }).catch(() => null)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const seo = settings?.effective?.seo || settings?.effective?.settings?.seo || {}
  const branding = settings?.effective?.branding || settings?.effective?.settings?.branding || {}
  return {
    title: seo?.defaultMetaTitle || 'DailyBrief — Classic News Theme',
    description: seo?.defaultMetaDescription || 'Classic newsroom design with beautiful typography, fast performance, and mobile-first layout.',
    manifest: '/manifest.json',
    metadataBase: new URL(baseUrl),
    openGraph: {
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    icons: branding?.faviconUrl ? { icon: [{ url: branding.faviconUrl }] } : undefined,
  }
}

export const viewport = {
  themeColor: '#111827'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers()
  const reqHost = hdrs.get('x-forwarded-host') || hdrs.get('host') || undefined
  const settings = await getDomainSettings({ revalidate: 60, timeoutMs: 4000, previewTenantDomain: reqHost }).catch(() => null)
  const layoutFlags = settings?.effective?.theme?.layout || settings?.effective?.settings?.theme?.layout || {}
  const branding = settings?.effective?.branding || settings?.effective?.settings?.branding || {}
  const siteUrl = getSiteUrl()
  const siteName = getSiteName()
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl || 'http://localhost:3000'
  }
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl || 'http://localhost:3000',
    logo: `${siteUrl || ''}/icons/icon-512.svg`
  }
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
  <HeaderDisha showTopBar={!!layoutFlags.showTopBar} showTicker={!!layoutFlags.showTicker} brandingLogoUrl={branding.logoUrl || undefined} />
        <JsonLd data={[websiteLd, orgLd]} />
        <div className="max-w-[var(--site-max)] mx-auto px-4">
          {children}
        </div>
        <SeoFooter />
        <PWAInstallPrompt />
        <BottomNav />
      </body>
    </html>
  )
}

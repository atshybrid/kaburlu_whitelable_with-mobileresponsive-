import './globals.css'
import HeaderDisha from '../components/HeaderDisha'
import BottomNav from '../components/BottomNav'
import PWAInstallPrompt from '../components/PWAInstallPrompt'
import JsonLd from '../components/JsonLd'
import SeoFooter from '../components/SeoFooter'
import { getSiteName, getSiteUrl } from '../lib/site'

export const metadata = {
  title: 'DailyBrief — Classic News Theme',
  description: 'Classic newsroom design with beautiful typography, fast performance, and mobile-first layout.',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
}

export const viewport = {
  themeColor: '#111827'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
  <HeaderDisha />
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

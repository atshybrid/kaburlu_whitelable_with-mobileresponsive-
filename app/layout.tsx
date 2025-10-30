import './globals.css'
import SiteHeader from '../components/SiteHeader'
import BottomNav from '../components/BottomNav'
import PWAInstallPrompt from '../components/PWAInstallPrompt'

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
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <SiteHeader />
        <div className="max-w-[var(--site-max)] mx-auto px-4">
          {children}
        </div>
        <PWAInstallPrompt />
        <BottomNav />
      </body>
    </html>
  )
}

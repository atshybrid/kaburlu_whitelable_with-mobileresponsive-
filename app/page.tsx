import { getEffectiveSettings } from '@/lib/settings'
import { getHomeFeed } from '@/lib/data'
import { ThemeHome as Style1Home } from '@/themes/style1'
import { ThemeHome as Style2Home } from '@/themes/style2'
import { ThemeHome as Style3Home } from '@/themes/style3'
import { ThemeHome as Tv9Home } from '@/themes/tv9'

export default async function Home() {
  // For root domain pages, use host-based settings and pick theme
  const settings = await getEffectiveSettings()
  const requestedThemeKey: string = settings?.theme?.key || 'style1'
  const themeMap = { style1: Style1Home, style2: Style2Home, style3: Style3Home, tv9: Tv9Home }
  const themeKey = (requestedThemeKey in themeMap ? requestedThemeKey : 'style1') as keyof typeof themeMap
  const Comp = themeMap[themeKey] || Style1Home
  // Use resilient getHomeFeed (it now falls back to dummy data on error)
  const articles = await getHomeFeed('na')
  const defaultTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'demo'
  return (
    <div className={`theme-${themeKey}`}>
      <Comp
        tenantSlug={defaultTenant}
        title={settings?.branding?.siteName || process.env.SITE_NAME || 'Kaburlu News'}
        articles={articles}
        settings={settings}
      />
    </div>
  )
}

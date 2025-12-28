import { getEffectiveSettings } from '@/lib/settings'
import { getHomeFeed } from '@/lib/data'

async function getThemeHome(themeKey: string) {
  switch (themeKey) {
    case 'style2':
      return (await import('@/themes/style2')).ThemeHome
    case 'style3':
      return (await import('@/themes/style3')).ThemeHome
    case 'tv9':
      return (await import('@/themes/tv9')).ThemeHome
    case 'style1':
    default:
      return (await import('@/themes/style1')).ThemeHome
  }
}

export default async function Home() {
  // For root domain pages, use host-based settings and pick theme
  const settings = await getEffectiveSettings()
  const requestedThemeKey: string = settings?.theme?.key || 'style1'
  const themeKey = (['style1', 'style2', 'style3', 'tv9'].includes(requestedThemeKey) ? requestedThemeKey : 'style1') as
    | 'style1'
    | 'style2'
    | 'style3'
    | 'tv9'
  const Comp = await getThemeHome(themeKey)
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

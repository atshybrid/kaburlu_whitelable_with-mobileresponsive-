import { getEffectiveSettings, getEffectiveSettingsForDomain } from '@/lib/settings'
import { getHomeFeed } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import type { ReactElement } from 'react'

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
  // For root domain pages, resolve tenant by host.
  const tenant = await resolveTenant()

  const settings = tenant.domain
    ? await getEffectiveSettingsForDomain(tenant.domain)
    : await getEffectiveSettings()
  const requestedThemeKey: string =
    settings?.theme?.theme ||
    settings?.theme?.key ||
    settings?.settings?.theme?.theme ||
    settings?.settings?.theme?.key ||
    'style1'
  const themeKey = (['style1', 'style2', 'style3', 'tv9'].includes(requestedThemeKey) ? requestedThemeKey : 'style1') as
    | 'style1'
    | 'style2'
    | 'style3'
    | 'tv9'
  const Comp = await getThemeHome(themeKey)

  // Use resilient getHomeFeed (it falls back to mock data on error)
  const articles = await getHomeFeed(tenant.id)

  type HomeComp = (p: { tenantSlug: string; title: string; articles: Article[]; settings?: EffectiveSettings; tenantDomain?: string }) => ReactElement
  const HomeComp = Comp as unknown as HomeComp

  return (
    <div className={`theme-${themeKey}`}>
      <HomeComp
        tenantSlug={tenant.slug}
        title={settings?.branding?.siteName || tenant.name || process.env.SITE_NAME || 'Kaburlu News'}
        articles={articles}
        settings={settings}
        tenantDomain={tenant.domain || undefined}
      />
    </div>
  )
}

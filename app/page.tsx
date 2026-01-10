import { getSettingsResult, getSettingsResultForDomain } from '@/lib/settings'
import { getHomeFeed } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import type { ThemeModule, ThemeHomeComponent } from '@/lib/theme-types'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import type { ReactElement } from 'react'

// Force dynamic rendering - domain check must be fresh on every request
export const dynamic = 'force-dynamic'

async function getThemeHome(themeKey: string): Promise<ThemeHomeComponent> {
  let themeModule: ThemeModule
  
  switch (themeKey) {
    case 'style2':
      themeModule = await import('@/themes/style2') as ThemeModule
      break
    case 'style3':
      themeModule = await import('@/themes/style3') as ThemeModule
      break
    case 'tv9':
      themeModule = await import('@/themes/tv9') as ThemeModule
      break
    case 'toi':
      themeModule = await import('@/themes/toi') as ThemeModule
      break
    case 'style1':
    default:
      themeModule = await import('@/themes/style1') as ThemeModule
      break
  }
  
  return themeModule.ThemeHome
}

export default async function Home() {
  // For root domain pages, resolve tenant by host.
  const tenant = await resolveTenant()

  // Handle domain not linked case - check directly from tenant resolution
  if (tenant.isDomainNotLinked) {
    return <DomainNotLinked domain={tenant.domain || tenant.name} />
  }
  
  // Handle API error case
  if (tenant.isApiError) {
    return (
      <TechnicalIssues 
        title="Technical Issues"
        message="We're experiencing technical difficulties with our API services. Please contact Kaburlu Media support."
      />
    )
  }

  // Get settings result with error information (for additional checks)
  const settingsResult = tenant.domain
    ? await getSettingsResultForDomain(tenant.domain)
    : await getSettingsResult()
  
  // Double-check: Handle domain not linked case from settings
  if (settingsResult.isDomainNotLinked) {
    return <DomainNotLinked domain={tenant.domain || tenant.name} />
  }
  
  // Handle API error case from settings
  if (settingsResult.isApiError) {
    return (
      <TechnicalIssues 
        title="Technical Issues"
        message="We're experiencing technical difficulties with our API services. Please contact Kaburlu Media support."
      />
    )
  }
  
  const settings = settingsResult.settings
  const requestedThemeKey: string =
    settings?.theme?.theme ||
    settings?.theme?.key ||
    settings?.settings?.theme?.theme ||
    settings?.settings?.theme?.key ||
    'style1'
  const themeKey = (['style1', 'style2', 'style3', 'tv9', 'toi'].includes(requestedThemeKey) ? requestedThemeKey : 'style1') as
    | 'style1'
    | 'style2'
    | 'style3'
    | 'tv9'
    | 'toi'
  const Comp = await getThemeHome(themeKey)

  // Use resilient getHomeFeed (it falls back to mock data on error)
  let articles: Article[]
  try {
    articles = await getHomeFeed(tenant.id)
  } catch {
    // If API fails, we'll let the theme components handle showing error messages
    articles = []
  }

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

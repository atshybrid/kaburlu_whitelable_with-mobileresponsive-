import { getHomeFeed } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import { getEffectiveSettingsForDomain, getSettingsResultForDomain } from '@/lib/settings'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import type { ThemeModule, ThemeHomeComponent } from '@/lib/theme-types'
import type { Article } from '@/lib/data-sources'

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

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  
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
  
  // Double-check domain settings for this tenant
  if (tenant.domain) {
    const settingsResult = await getSettingsResultForDomain(tenant.domain)
    
    // Handle domain not linked case
    if (settingsResult.isDomainNotLinked) {
      return <DomainNotLinked domain={tenant.domain} />
    }
    
    // Handle API error case
    if (settingsResult.isApiError) {
      return (
        <TechnicalIssues 
          title="Technical Issues"
          message="We're experiencing technical difficulties with our API services. Please contact Kaburlu Media support."
        />
      )
    }
  }
  
  const settings = tenant.domain ? await getEffectiveSettingsForDomain(tenant.domain) : await getEffectiveSettingsForDomain('localhost')
  
  // ✅ Fetch data based on theme type
  // style2, style3, tv9, toi fetch their own data internally
  // Only style1 needs articles from getHomeFeed
  let articles: Article[] = []
  if (tenant.themeKey === 'style1') {
    articles = await getHomeFeed(tenant.id)
  }
  
  const ThemeHomeComp = await getThemeHome(tenant.themeKey)

  return (
    <ThemeHomeComp 
      tenantSlug={tenant.slug} 
      title={tenant.name} 
      articles={articles} 
      settings={settings} 
      tenantDomain={tenant.domain || undefined} 
    />
  )
}

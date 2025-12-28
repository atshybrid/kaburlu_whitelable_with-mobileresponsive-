import { getHomeFeed } from '@/lib/data'
import { getTenantFromHeaders } from '@/lib/tenant'

import { getEffectiveSettings } from '@/lib/settings'
import type { ReactElement } from 'react'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'

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

export default async function TenantHomePage() {
  const tenant = await getTenantFromHeaders()
  const articles = await getHomeFeed(tenant.id)
  const settings = await getEffectiveSettings()

  type HomeComp = (p: { tenantSlug: string; title: string; articles: Article[]; settings?: EffectiveSettings }) => ReactElement
  const Comp = (await getThemeHome(tenant.themeKey)) as HomeComp

  return <Comp tenantSlug={tenant.slug} title={tenant.name} articles={articles} settings={settings} />
}

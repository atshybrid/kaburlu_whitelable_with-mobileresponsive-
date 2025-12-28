import { getHomeFeed } from '@/lib/data'
import { getTenantFromHeaders } from '@/lib/tenant'
import { ThemeHome as Style1Home } from '@/themes/style1'
import { ThemeHome as Style2Home } from '@/themes/style2'
import { ThemeHome as Style3Home } from '@/themes/style3'
import { ThemeHome as Tv9Home } from '@/themes/tv9'

import { getEffectiveSettings } from '@/lib/settings'
import type { ReactElement } from 'react'
import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'

export default async function TenantHomePage() {
  const tenant = await getTenantFromHeaders()
  const articles = await getHomeFeed(tenant.id)
  const settings = await getEffectiveSettings()

  type HomeComp = (p: { tenantSlug: string; title: string; articles: Article[]; settings?: EffectiveSettings }) => ReactElement
  const map: Record<string, HomeComp> = {
    style1: Style1Home,
    style2: Style2Home,
    style3: Style3Home,
    tv9: Tv9Home,
  }
  const Comp = map[tenant.themeKey] || Style1Home

  return <Comp tenantSlug={tenant.slug} title={tenant.name} articles={articles} settings={settings} />
}

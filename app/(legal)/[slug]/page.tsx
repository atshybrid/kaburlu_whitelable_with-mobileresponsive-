import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/pages/LegalPage'
import { LEGAL_PAGE_KEYS, LEGAL_PAGE_META, isLegalPageKey, type LegalPageKey } from '@/lib/legal-pages'
import { resolveTenant } from '@/lib/tenant'
import { getEffectiveSettings, getEffectiveSettingsForDomain } from '@/lib/settings'
import type { EffectiveSettings } from '@/lib/remote'
import { themeCssVarsFromSettings } from '@/lib/theme-vars'

export function generateStaticParams() {
  return LEGAL_PAGE_KEYS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!isLegalPageKey(slug)) return {}

  const tenant = await resolveTenant()
  const settings = tenant.domain ? await getEffectiveSettingsForDomain(tenant.domain) : await getEffectiveSettings()
  const siteTitle = settings?.branding?.siteName || tenant.name || process.env.SITE_NAME || 'Kaburlu News'

  const meta = LEGAL_PAGE_META[slug]
  return {
    title: `${meta.title} | ${siteTitle}`,
    description: meta.description,
  }
}

function pickThemeKey(settings?: EffectiveSettings) {
  const requestedThemeKey: string =
    settings?.theme?.theme ||
    settings?.theme?.key ||
    settings?.settings?.theme?.theme ||
    settings?.settings?.theme?.key ||
    'style1'

  return (['style1', 'style2', 'style3', 'tv9'].includes(requestedThemeKey) ? requestedThemeKey : 'style1') as
    | 'style1'
    | 'style2'
    | 'style3'
    | 'tv9'
}

export default async function LegalSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isLegalPageKey(slug)) notFound()

  const pageKey = slug as LegalPageKey

  const tenant = await resolveTenant()
  const settings = tenant.domain ? await getEffectiveSettingsForDomain(tenant.domain) : await getEffectiveSettings()
  const siteTitle = settings?.branding?.siteName || tenant.name || process.env.SITE_NAME || 'Kaburlu News'

  const themeKey = pickThemeKey(settings)
  const cssVars = themeKey === 'style2' ? themeCssVarsFromSettings(settings) : undefined

  return (
    <div className={`theme-${themeKey}`} style={cssVars}>
      <LegalPage pageKey={pageKey} tenantSlug={tenant.slug} siteTitle={siteTitle} settings={settings} themeKey={themeKey} />
    </div>
  )
}

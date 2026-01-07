import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/pages/LegalPage'
import { LEGAL_PAGE_META, isLegalPageKey, type LegalPageKey } from '@/lib/legal-pages'
import { resolveTenant } from '@/lib/tenant'
import { getEffectiveSettingsForDomain } from '@/lib/settings'
import { themeCssVarsFromSettings } from '@/lib/theme-vars'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>
}): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params
  if (!isLegalPageKey(slug)) return {}

  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  const settings = tenant.domain ? await getEffectiveSettingsForDomain(tenant.domain) : undefined
  const siteTitle = settings?.branding?.siteName || tenant.name || process.env.SITE_NAME || 'Kaburlu News'

  const meta = LEGAL_PAGE_META[slug]
  return {
    title: `${meta.title} | ${siteTitle}`,
    description: meta.description,
  }
}

export default async function TenantLegalSlugPage({ params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant: tenantSlug, slug } = await params
  if (!isLegalPageKey(slug)) notFound()

  const pageKey = slug as LegalPageKey

  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  const settings = tenant.domain ? await getEffectiveSettingsForDomain(tenant.domain) : undefined
  const siteTitle = settings?.branding?.siteName || tenant.name || process.env.SITE_NAME || 'Kaburlu News'

  const cssVars = tenant.themeKey === 'style2' ? themeCssVarsFromSettings(settings) : undefined

  return (
    <div style={cssVars}>
      <LegalPage pageKey={pageKey} tenantSlug={tenant.slug} siteTitle={siteTitle} settings={settings} themeKey={tenant.themeKey} />
    </div>
  )
}

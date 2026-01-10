import '@/themes/style1/theme.css'
import '@/themes/style2/theme.css'
import '@/themes/style3/theme.css'
import '@/themes/tv9/theme.css'
import { resolveTenant } from '@/lib/tenant'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant: tenantSlug } = await params
  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  
  // Return minimal metadata if domain is not linked
  if (tenant.isDomainNotLinked) {
    return {
      title: 'Domain Not Linked | Kaburlu Media',
      description: 'This domain is not linked to Kaburlu Media platform.',
    }
  }
  
  return {
    title: `${tenant.name} | Kaburlu News`,
    description: `${tenant.name} latest news and updates`,
  }
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const tenant = await resolveTenant({ slugOverride: tenantSlug })
  
  // Don't apply theme wrapper if domain is not linked or has API error
  if (tenant.isDomainNotLinked || tenant.isApiError) {
    return <>{children}</>
  }
  
  return <div className={`theme-${tenant.themeKey}`}>{children}</div>
}

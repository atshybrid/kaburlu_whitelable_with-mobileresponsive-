import '@/themes/style1/theme.css'
import '@/themes/style2/theme.css'
import '@/themes/style3/theme.css'
import '@/themes/tv9/theme.css'
import { getTenantFromHeaders } from '@/lib/tenant'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantFromHeaders()
  return {
    title: `${tenant.name} | Kaburlu News`,
    description: `${tenant.name} latest news and updates`,
  }
}

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenantFromHeaders()
  return <div className={`theme-${tenant.themeKey}`}>{children}</div>
}

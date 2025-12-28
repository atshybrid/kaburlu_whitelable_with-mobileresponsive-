import { headers } from 'next/headers'
import { getDomainSettings } from './remote'

export type Tenant = {
  id: string
  slug: string
  name: string
  themeKey: string
  domain?: string | null
}

export async function getTenantFromHeaders() {
  const h = await headers()
  const mode = process.env.MULTITENANT_MODE || 'path'
  const defaultTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'demo'

  let slug = defaultTenant

  const host = h.get('host') || ''
  const pathname = h.get('x-pathname') || ''

  if (mode === 'subdomain' && host && !host.startsWith('localhost')) {
    const parts = host.split('.')
    if (parts.length > 2) slug = parts[0]
  }

  if (mode === 'path' && pathname.startsWith('/t/')) {
    const seg = pathname.split('/')
    if (seg[2]) slug = seg[2]
  }

  const domain = (host || 'localhost').split(':')[0]
  try {
    const res = await getDomainSettings(domain)
    const themeKey = res?.effective?.theme?.key || 'style1'
    return { id: res.tenantId ?? 'na', slug, name: slug, themeKey, domain: res.domain ?? domain }
  } catch {
    return { id: 'na', slug, name: slug, themeKey: 'style1', domain }
  }
}

import { headers } from 'next/headers'
import { getDomainSettings, normalizeTenantDomain } from './remote'
import { DEFAULT_TENANTS } from '@/config/tenants'

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
    const parts = normalizeTenantDomain(host).split('.')
    if (parts.length > 2) slug = parts[0]
  }

  if (mode === 'path' && pathname.startsWith('/t/')) {
    const seg = pathname.split('/')
    if (seg[2]) slug = seg[2]
  }

  const local = DEFAULT_TENANTS.find((t) => t.slug === slug)

  const domain = normalizeTenantDomain(host || 'localhost')
  try {
    const res = await getDomainSettings(domain)
    const remoteThemeKey = res?.effective?.theme?.theme || res?.effective?.theme?.key || 'style1'
    const themeKey = remoteThemeKey || local?.themeKey || 'style1'
    const name = local?.name || slug
    return { id: res.tenantId ?? 'na', slug, name, themeKey, domain: res.domain ?? domain }
  } catch {
    const themeKey = local?.themeKey || 'style1'
    const name = local?.name || slug
    return { id: 'na', slug, name, themeKey, domain }
  }
}

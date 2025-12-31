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

export async function resolveTenant({ slugOverride }: { slugOverride?: string } = {}) {
  const h = await headers()
  const mode = process.env.MULTITENANT_MODE || 'path'
  const defaultTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'demo'

  let slug = (slugOverride || '').trim() || defaultTenant

  const host = h.get('host') || ''
  const pathname = h.get('x-pathname') || ''

  if (mode === 'subdomain' && host && !host.startsWith('localhost')) {
    const parts = normalizeTenantDomain(host).split('.')
    if (parts.length > 2) slug = parts[0]
  }

  // NOTE: `x-pathname` is set by `proxy.ts` in local/dev setups.
  // In production, it may be missing; prefer passing `slugOverride` from route params.
  if (!slugOverride && mode === 'path' && pathname.startsWith('/t/')) {
    const seg = pathname.split('/')
    if (seg[2]) slug = seg[2]
  }

  const local = DEFAULT_TENANTS.find((t) => t.slug === slug)

  // In path-based multitenancy deployments (e.g. Vercel), the host may be the app domain.
  // If the route param itself looks like a domain, treat it as the tenant domain.
  const slugLooksLikeDomain = slug.includes('.') && !slug.includes('/')
  const domain = normalizeTenantDomain(slugLooksLikeDomain ? slug : (host || 'localhost'))
  try {
    const res = await getDomainSettings(domain)
    const remoteThemeKey = res?.effective?.theme?.theme || res?.effective?.theme?.key || 'style1'
    const themeKey = local?.themeKey || remoteThemeKey || 'style1'
    const name = local?.name || slug
    return { id: res.tenantId ?? 'na', slug, name, themeKey, domain: res.domain ?? domain }
  } catch {
    const themeKey = local?.themeKey || 'style1'
    const name = local?.name || slug
    return { id: 'na', slug, name, themeKey, domain }
  }
}

export async function getTenantFromHeaders() {
  return resolveTenant()
}

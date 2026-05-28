import { headers } from 'next/headers'
import { normalizeTenantDomain } from './remote'
import { getConfigForDomain } from './config'
import { DEFAULT_TENANTS } from '@/config/tenants'

export type Tenant = {
  id: string
  slug: string
  name: string
  themeKey: string
  domain?: string | null
  isDomainNotLinked?: boolean
  isApiError?: boolean
}

export async function resolveTenant({ slugOverride }: { slugOverride?: string } = {}): Promise<Tenant> {
  const h = await headers()
  const mode = process.env.MULTITENANT_MODE || 'path'
  const defaultTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'demo'

  let slug = (slugOverride || '').trim() || defaultTenant

  const host = h.get('host') || ''
  const pathname = h.get('x-pathname') || ''
  const normalizedHost = normalizeTenantDomain(host || 'localhost')
  const isLocalhost = normalizedHost === 'localhost' || normalizedHost === '127.0.0.1'

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

  // ✅ CRITICAL: Use X-Tenant-Domain header set by proxy.ts (supports NEXT_PUBLIC_DEV_DOMAIN in localhost)
  // Instead of using raw 'host' header which would be 'localhost' in development
  const tenantDomainFromProxy = h.get('X-Tenant-Domain') || h.get('x-tenant-domain')
  
  // In path-based multitenancy deployments (e.g. Vercel), the host may be the app domain.
  // If the route param itself looks like a domain, treat it as the tenant domain.
  const slugLooksLikeDomain = slug.includes('.') && !slug.includes('/')
  const domain = normalizeTenantDomain(tenantDomainFromProxy || (slugLooksLikeDomain ? slug : (host || 'localhost')))
  
  try {
    // 🎯 NEW: Use /public/config API instead of old /public/domain/settings
    const config = await getConfigForDomain(domain)
    
    if (!config) {
      const themeKey = local?.themeKey || 'style1'
      const name = local?.name || slug
      return { id: 'na', slug, name, themeKey, domain, isDomainNotLinked: true, isApiError: true }
    }
    
    // ✅ Local testing override:
    // On localhost, prefer local tenant theme so /t/andhra => style2, /t/telangana => style3.
    // You can also force a specific local theme via LOCAL_THEME_KEY / NEXT_PUBLIC_LOCAL_THEME_KEY.
    const forcedLocalTheme = (process.env.LOCAL_THEME_KEY || process.env.NEXT_PUBLIC_LOCAL_THEME_KEY || '').trim()
    const localTheme = local?.themeKey || ''
    const backendTheme = config.theme?.layout?.style || ''
    const themeKey = isLocalhost
      ? (forcedLocalTheme || localTheme || backendTheme || 'style1')
      : (backendTheme || localTheme || 'style1')
    const name = config.tenant.displayName || config.tenant.name || local?.name || slug
    
    return { 
      id: config.tenant.id, 
      slug: config.tenant.slug, 
      name, 
      themeKey, 
      domain: config.domain.domain, 
      isDomainNotLinked: false, 
      isApiError: false 
    }
  } catch (error) {
    const errorMessage = String(error).toLowerCase()
    
    // Check if it's a domain not found / not linked error (404)
    const isDomainNotLinked = errorMessage.includes('404') || 
        errorMessage.includes('not found') || 
        errorMessage.includes('domain not linked') ||
        errorMessage.includes('domain_not_found') ||
        errorMessage.includes('tenant not found')
    
    const themeKey = local?.themeKey || 'style1'
    const name = local?.name || slug
    return { 
      id: 'na', 
      slug, 
      name, 
      themeKey, 
      domain,
      isDomainNotLinked,
      isApiError: !isDomainNotLinked
    }
  }
}

export async function getTenantFromHeaders() {
  return resolveTenant()
}

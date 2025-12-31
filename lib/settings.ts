import { headers } from 'next/headers'
import { getDomainSettings, normalizeTenantDomain, type EffectiveSettings } from './remote'
import { cache as reactCache } from 'react'

type CacheEntry = { value: EffectiveSettings; expires: number }
const cache = new Map<string, CacheEntry>()
const TTL_MS = Number(process.env.REMOTE_SETTINGS_MEMORY_TTL_SECONDS || '300') * 1000

function domainFromHeaders(h: Headers) {
  const host = h.get('host') || 'localhost'
  return normalizeTenantDomain(host)
}

export async function getEffectiveSettings(): Promise<EffectiveSettings> {
  return _getEffectiveSettings()
}

export async function getEffectiveSettingsForDomain(tenantDomain: string): Promise<EffectiveSettings> {
  return _getEffectiveSettings(normalizeTenantDomain(tenantDomain))
}

const _getEffectiveSettings = reactCache(async (domainOverride?: string): Promise<EffectiveSettings> => {
  const h = await headers()
  const headerDomain = normalizeTenantDomain(h.get('x-tenant-domain') || '')
  const domain = normalizeTenantDomain(domainOverride || headerDomain || domainFromHeaders(h))
  const now = Date.now()
  const key = `settings:${domain}`
  const hit = cache.get(key)
  if (hit && hit.expires > now) return hit.value
  let effective: EffectiveSettings = {}
  try {
    const res = await getDomainSettings(domain)
    effective = res.effective || {}
  } catch {
    // Graceful fallback when remote settings are unavailable
    effective = {}
  }
  cache.set(key, { value: effective, expires: now + TTL_MS })
  return effective
})

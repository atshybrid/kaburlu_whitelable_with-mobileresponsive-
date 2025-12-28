import { headers } from 'next/headers'
import { getDomainSettings, type EffectiveSettings } from './remote'
import { cache as reactCache } from 'react'

type CacheEntry = { value: EffectiveSettings; expires: number }
const cache = new Map<string, CacheEntry>()
const TTL_MS = Number(process.env.REMOTE_SETTINGS_MEMORY_TTL_SECONDS || '300') * 1000

function domainFromHeaders(h: Headers) {
  const host = h.get('host') || 'localhost'
  return host.split(':')[0]
}

export async function getEffectiveSettings(): Promise<EffectiveSettings> {
  return _getEffectiveSettings()
}

const _getEffectiveSettings = reactCache(async (): Promise<EffectiveSettings> => {
  const h = await headers()
  const domain = domainFromHeaders(h)
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

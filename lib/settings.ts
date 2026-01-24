import { headers } from 'next/headers'
import { getDomainSettings, normalizeTenantDomain, type EffectiveSettings } from './remote'
import { cache as reactCache } from 'react'
import { isWrongTenantData } from './fallback-data'

export type SettingsResult = {
  settings: EffectiveSettings
  isDomainNotLinked: boolean
  isApiError: boolean
}

type CacheEntry = { value: SettingsResult; expires: number }
const cache = new Map<string, CacheEntry>()
const TTL_MS = Number(process.env.REMOTE_SETTINGS_MEMORY_TTL_SECONDS || '300') * 1000

function domainFromHeaders(h: Headers) {
  const host = h.get('host') || 'localhost'
  return normalizeTenantDomain(host)
}

export async function getEffectiveSettings(): Promise<EffectiveSettings> {
  const result = await _getSettingsResult()
  return result.settings
}

export async function getEffectiveSettingsForDomain(tenantDomain: string): Promise<EffectiveSettings> {
  const result = await _getSettingsResult(normalizeTenantDomain(tenantDomain))
  return result.settings
}

export async function getSettingsResult(): Promise<SettingsResult> {
  return _getSettingsResult()
}

export async function getSettingsResultForDomain(tenantDomain: string): Promise<SettingsResult> {
  return _getSettingsResult(normalizeTenantDomain(tenantDomain))
}

const _getSettingsResult = reactCache(async (domainOverride?: string): Promise<SettingsResult> => {
  const h = await headers()
  const headerDomain = normalizeTenantDomain(h.get('x-tenant-domain') || '')
  const domain = normalizeTenantDomain(domainOverride || headerDomain || domainFromHeaders(h))
  const now = Date.now()
  const key = `settings:${domain}`
  const hit = cache.get(key)
  
  // Only use cache for successful results, not for error states
  if (hit && hit.expires > now && !hit.value.isDomainNotLinked && !hit.value.isApiError) {
    return hit.value
  }
  
  let result: SettingsResult = {
    settings: {},
    isDomainNotLinked: false,
    isApiError: false
  }
  
  try {
    const res = await getDomainSettings(domain)
    
    // Check if settings belong to wrong tenant (e.g., Crown Human Rights)
    if (isWrongTenantData(res)) {
      console.log('🚫 Wrong tenant settings detected, returning empty settings')
      result.settings = {}
      // Don't mark as isDomainNotLinked - we want to show fallback articles, not "coming soon"
      result.isDomainNotLinked = false
      result.isApiError = false
      return result
    }
    
    result.settings = res.effective || {}
    // Only cache successful results
    cache.set(key, { value: result, expires: now + TTL_MS })
  } catch (error) {
    const errorMessage = String(error).toLowerCase()
    
    // Check if it's a domain not found / not linked error
    if (errorMessage.includes('404') || 
        errorMessage.includes('not found') || 
        errorMessage.includes('domain not linked') ||
        errorMessage.includes('domain_not_found') ||
        errorMessage.includes('not_found_or_inactive') ||
        errorMessage.includes('tenant not found') ||
        errorMessage.includes('unknown')) {
      result.isDomainNotLinked = true
    } else {
      // Other API errors (500, network issues, etc.)
      result.isApiError = true
    }
    
    // Don't cache error results - always check fresh
    result.settings = {}
  }
  
  return result
  return result
})

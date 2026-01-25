import { headers } from 'next/headers'
import { normalizeTenantDomain, type EffectiveSettings } from './remote'
import { getConfigForDomain } from './config'
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
  // 🎯 SIMPLE: If HOST env is set, use it directly
  if (process.env.HOST) {
    return normalizeTenantDomain(process.env.HOST)
  }
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
    // 🎯 NEW: Use /public/config API instead of old /public/domain/settings
    const config = await getConfigForDomain(domain)
    
    if (!config) {
      console.log('⚠️ No config returned for domain:', domain)
      result.settings = {}
      result.isApiError = true
      return result
    }
    
    // Map new config format to old EffectiveSettings format
    result.settings = {
      seo: {
        defaultMetaTitle: config.seo.meta.title,
        defaultMetaDescription: config.seo.meta.description,
      },
      content: {
        defaultLanguage: config.content.defaultLanguage || 'te',
      },
      branding: {
        logoUrl: (config.branding as any).logoUrl || config.branding.logo,
        faviconUrl: (config.branding as any).faviconUrl || config.branding.favicon,
        siteName: config.branding.siteName,
      },
      theme: {
        colors: {
          primary: (config.branding as any).primaryColor || config.theme?.colors?.primary,
          secondary: (config.branding as any).secondaryColor || config.theme?.colors?.secondary,
        },
        layout: {
          showTicker: config.layout.showTicker !== false,
          showTopBar: config.layout.showTopBar !== false,
        },
      },
      ads: {
        enabled: Boolean((config.integrations.ads as any).adsenseClientId || config.integrations.ads.adsense),
        googleAdsense: {
          client: (config.integrations.ads as any).adsenseClientId || config.integrations.ads.adsense || '',
        },
      },
      settings: {
        seo: {
          defaultMetaTitle: config.seo.meta.title,
          defaultMetaDescription: config.seo.meta.description,
        },
        content: {
          defaultLanguage: config.content.defaultLanguage || 'te',
        },
        branding: {
          logoUrl: (config.branding as any).logoUrl || config.branding.logo,
          siteName: config.branding.siteName,
        },
      },
    }
    
    cache.set(key, { value: result, expires: now + TTL_MS })
    return result
  } catch (error) {
    console.error('⚠️ Error fetching config for settings:', error)
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
})

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
        defaultMetaTitle: config.seo?.meta?.title || '',
        defaultMetaDescription: config.seo?.meta?.description || '',
        defaultMetaKeywords: config.seo?.meta?.keywords || '',
        canonicalBaseUrl: config.domain?.baseUrl || '',
        ogImageUrl: config.seo?.openGraph?.imageUrl || '',
      },
      content: {
        defaultLanguage: config.content?.defaultLanguage || 'te',
      },
      branding: {
        logoUrl: config.branding?.logo || '',
        faviconUrl: config.branding?.favicon || '',
        siteName: config.branding?.siteName || config.tenant?.displayName || '',
        siteTagline: config.branding?.siteTagline || '',
      },
      theme: {
        colors: {
          primary: config.theme?.colors?.primary || '#dc2626',
          secondary: config.theme?.colors?.secondary || '#ea580c',
          headerBg: config.theme?.colors?.headerBg || '#ffffff',
          footerBg: config.theme?.colors?.footerBg || '#f5f5f5',
        },
        layout: {
          showTicker: config.layout?.showTicker !== false,
          showTopBar: config.layout?.showTopBar !== false,
          showBreadcrumbs: config.layout?.showBreadcrumbs !== false,
          showReadingProgress: config.layout?.showReadingProgress !== false,
          themeStyle: config.theme?.layout?.style || 'style1',
        },
      },
      ads: {
        enabled: Boolean(config.integrations?.ads?.adsense),
        googleAdsense: {
          client: config.integrations?.ads?.adsense || '',
        },
      },
      social: {
        facebook: config.social?.facebook || '',
        twitter: config.social?.twitter || '',
        instagram: config.social?.instagram || '',
        youtube: config.social?.youtube || '',
        telegram: config.social?.telegram || '',
        linkedin: config.social?.linkedin || '',
        whatsapp: config.social?.whatsapp || '',
      },
      contact: {
        email: config.contact?.email || '',
        phone: config.contact?.phone || '',
        city: config.contact?.address?.city || '',
        region: config.contact?.address?.state || '',
        country: config.contact?.address?.country || 'India',
      },
      navigation: {
        footer: config.navigation?.footer || {},
      },
      tenant: {
        id: config.tenant?.id || '',
        slug: config.tenant?.slug || '',
        name: config.tenant?.name || '',
        displayName: config.tenant?.displayName || config.tenant?.name || '',
        nativeName: config.tenant?.nativeName || '',
      },
      settings: {
        seo: {
          defaultMetaTitle: config.seo?.meta?.title || '',
          defaultMetaDescription: config.seo?.meta?.description || '',
        },
        content: {
          defaultLanguage: config.content?.defaultLanguage || 'te',
        },
        branding: {
          logoUrl: config.branding?.logo || '',
          siteName: config.branding?.siteName || config.tenant?.displayName || '',
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

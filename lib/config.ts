/**
 * 🎯 SINGLE SOURCE OF TRUTH: /public/config API Integration
 * 
 * This module fetches and manages tenant configuration from the backend.
 * It provides branding, SEO, language, integrations, and layout settings.
 * 
 * Architecture:
 * - Fetched once per request (React Cache)
 * - Cached in memory with TTL
 * - Fallback to safe defaults when API fails
 * - Type-safe access to all config values
 */

import { headers } from 'next/headers'
import { cache as reactCache } from 'react'
import { normalizeTenantDomain } from './remote'

const API_BASE_URL = process.env.API_BASE_URL || 'https://app.kaburlumedia.com/api/v1'
const CONFIG_TTL_MS = Number(process.env.CONFIG_CACHE_TTL_SECONDS || '300') * 1000

// ============================================================================
// Types (matching backend response exactly)
// ============================================================================

export interface TenantConfig {
  tenant: {
    id: string
    slug: string
    name: string
    displayName: string
  }
  domain: {
    id: string
    domain: string
    kind: 'NEWS' | 'MAGAZINE' | 'BLOG'
    status: 'ACTIVE' | 'INACTIVE'
  }
  branding: {
    logoUrl: string | null
    faviconUrl: string | null
    primaryColor: string | null
    secondaryColor: string | null
    siteName: string
    fontFamily: string | null
  }
  seo: {
    meta: {
      title: string
      description: string
      keywords: string | null
    }
    openGraph: {
      url: string
      title: string
      description: string
      imageUrl: string | null
      siteName: string
    }
    twitter: {
      card: 'summary' | 'summary_large_image'
      handle: string | null
      title: string
      description: string
      imageUrl: string | null
    }
    urls: {
      robotsTxt: string
      sitemapXml: string
    }
  }
  content: {
    defaultLanguage: string
    languages: Array<{
      code: string
      name: string
      nativeName: string
      direction: 'ltr' | 'rtl'
      defaultForTenant: boolean
    }>
  }
  integrations: {
    analytics: {
      googleAnalyticsId: string | null
      gtmId: string | null
    }
    ads: {
      adsenseClientId: string | null
    }
    push: {
      vapidPublicKey: string | null
    }
  }
  layout: {
    showTicker: boolean | null
    showTopBar: boolean | null
  }
  tenantAdmin: {
    name: string
    mobile: string
  }
}

export interface ConfigResult {
  config: TenantConfig | null
  isError: boolean
  errorMessage?: string
}

// ============================================================================
// In-Memory Cache
// ============================================================================

type CacheEntry = { value: ConfigResult; expires: number }
const cache = new Map<string, CacheEntry>()

function getCacheKey(domain: string): string {
  return `config:${domain}`
}

// ============================================================================
// Domain Detection
// ============================================================================

function domainFromHeaders(h: Headers): string {
  const host = h.get('host') || 'localhost'
  return normalizeTenantDomain(host)
}

async function getTargetDomain(domainOverride?: string): Promise<string> {
  const h = await headers()
  const headerDomain = normalizeTenantDomain(h.get('x-tenant-domain') || '')
  
  return normalizeTenantDomain(
    domainOverride || 
    headerDomain || 
    domainFromHeaders(h) ||
    process.env.HOST ||
    'localhost'
  )
}

// ============================================================================
// API Fetcher
// ============================================================================

async function fetchConfig(tenantDomain: string): Promise<ConfigResult> {
  const url = `${API_BASE_URL}/public/config`
  
  try {
    const res = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'X-Tenant-Domain': tenantDomain,
      },
      cache: 'no-store', // Always fetch fresh for config
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      console.error(`❌ Config API failed: ${res.status} ${res.statusText}`)
      return {
        config: null,
        isError: true,
        errorMessage: `HTTP ${res.status}: ${res.statusText}`,
      }
    }

    const config = await res.json() as TenantConfig
    console.log(`✅ Config loaded for ${tenantDomain}:`, config.branding.siteName)
    
    return {
      config,
      isError: false,
    }
  } catch (error) {
    console.error('❌ Config API error:', error)
    return {
      config: null,
      isError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// Cached Getter (React Cache + Memory Cache)
// ============================================================================

const _getConfigResult = reactCache(async (domainOverride?: string): Promise<ConfigResult> => {
  const domain = await getTargetDomain(domainOverride)
  const now = Date.now()
  const key = getCacheKey(domain)
  
  // Check memory cache
  const hit = cache.get(key)
  if (hit && hit.expires > now && !hit.value.isError) {
    console.log(`📦 Config cache hit for ${domain}`)
    return hit.value
  }

  // Fetch fresh
  const result = await fetchConfig(domain)
  
  // Cache successful results only
  if (!result.isError) {
    cache.set(key, {
      value: result,
      expires: now + CONFIG_TTL_MS,
    })
  }

  return result
})

// ============================================================================
// Public API
// ============================================================================

/**
 * Get tenant configuration (primary method)
 * Uses domain from headers or environment
 */
export async function getConfig(): Promise<TenantConfig | null> {
  const result = await _getConfigResult()
  return result.config
}

/**
 * Get tenant configuration for specific domain
 */
export async function getConfigForDomain(tenantDomain: string): Promise<TenantConfig | null> {
  const result = await _getConfigResult(normalizeTenantDomain(tenantDomain))
  return result.config
}

/**
 * Get config result with error info
 */
export async function getConfigResult(): Promise<ConfigResult> {
  return _getConfigResult()
}

/**
 * Get config result for specific domain
 */
export async function getConfigResultForDomain(tenantDomain: string): Promise<ConfigResult> {
  return _getConfigResult(normalizeTenantDomain(tenantDomain))
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get primary color in HSL format for CSS variables
 */
export function getPrimaryColorHSL(config: TenantConfig | null): string | null {
  if (!config?.branding.primaryColor) return null
  return hexToHslTriplet(config.branding.primaryColor)
}

/**
 * Get secondary color in HSL format for CSS variables
 */
export function getSecondaryColorHSL(config: TenantConfig | null): string | null {
  if (!config?.branding.secondaryColor) return null
  return hexToHslTriplet(config.branding.secondaryColor)
}

/**
 * Convert hex color to HSL triplet for CSS variables
 */
function hexToHslTriplet(hex: string): string | null {
  const rgb = hexToRgb01(hex)
  if (!rgb) return null

  const { r, g, b } = rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  const hh = Math.round(h)
  const ss = Math.round(Math.min(1, Math.max(0, s)) * 100)
  const ll = Math.round(Math.min(1, Math.max(0, l)) * 100)

  return `${hh} ${ss}% ${ll}%`
}

function hexToRgb01(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace(/^#/, '')
  const normalized = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  if (normalized.length !== 6) return null
  const n = Number.parseInt(normalized, 16)
  if (!Number.isFinite(n)) return null
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return { r: r / 255, g: g / 255, b: b / 255 }
}

/**
 * Get CSS variables for theme colors
 */
export function getThemeCssVars(config: TenantConfig | null): Record<string, string> {
  const vars: Record<string, string> = {}
  
  const primary = getPrimaryColorHSL(config)
  const secondary = getSecondaryColorHSL(config)
  
  if (primary) {
    vars['--accent'] = primary
    vars['--primary'] = primary
  }
  if (secondary) {
    vars['--secondary'] = secondary
  }
  
  return vars
}

/**
 * Check if analytics should be loaded
 */
export function shouldLoadAnalytics(config: TenantConfig | null): boolean {
  return !!(config?.integrations.analytics.googleAnalyticsId || config?.integrations.analytics.gtmId)
}

/**
 * Check if ads should be loaded
 */
export function shouldLoadAds(config: TenantConfig | null): boolean {
  return !!config?.integrations.ads.adsenseClientId
}

/**
 * Check if push notifications should be enabled
 */
export function shouldLoadPush(config: TenantConfig | null): boolean {
  return !!config?.integrations.push.vapidPublicKey
}

/**
 * Get default language code
 */
export function getDefaultLanguage(config: TenantConfig | null): string {
  return config?.content.defaultLanguage || 'te'
}

/**
 * Get default language direction
 */
export function getDefaultLanguageDirection(config: TenantConfig | null): 'ltr' | 'rtl' {
  const defaultLang = config?.content.languages.find(l => l.defaultForTenant)
  return defaultLang?.direction || 'ltr'
}

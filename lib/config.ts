/**
 * 🎯 SINGLE SOURCE OF TRUTH: /public/config API Integration (v2.0)
 * 
 * This module fetches and manages tenant configuration from the backend.
 * It provides branding, SEO, language, integrations, theme, and layout settings.
 * 
 * Architecture:
 * - Fetched once per request (React Cache)
 * - Cached in memory with TTL from cacheControl.config
 * - Fallback to safe defaults when API fails
 * - Type-safe access to all config values
 */

import { cache as reactCache } from 'react'
import { fetchJSON, normalizeTenantDomain } from './remote'

// ============================================================================
// Types (matching backend v2.0 response)
// ============================================================================

export interface TenantConfig {
  version: string
  timestamp: string
  
  tenant: {
    id: string
    slug: string
    name: string
    displayName: string
    nativeName: string
    timezone: string
    locale: string
  }
  
  domain: {
    id: string
    domain: string
    baseUrl: string
    kind: 'NEWS' | 'MAGAZINE' | 'BLOG'
    status: 'ACTIVE' | 'INACTIVE'
    environment: string
  }
  
  branding: {
    siteName: string
    siteTagline: string | null
    logo: string
    favicon: string
    appleTouchIcon: string
    // v2 additions (some tenants send both)
    logoUrl?: string
    faviconUrl?: string
  }
  
  theme: {
    colors: {
      primary: string
      secondary: string
      headerBg: string
      footerBg: string
    }
    typography: {
      fontFamily: string
      fontFamilyHeadings: string | null
    }
    assets: {
      logo: string
      favicon: string
      headerHtml: string | null
      footerHtml: string | null
    }
    layout: {
      style: string
      headerStyle: string
      footerStyle: string
      containerWidth: number
      homepageConfig: Record<string, unknown>
    }
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
    jsonLd: {
      organizationUrl: string
      websiteUrl: string
    }
    urls: {
      robotsTxt: string
      sitemapXml: string
      rssFeed: string
    }
  }
  
  content: {
    defaultLanguage: string
    supportedLanguages: string[]
    languages: Array<{
      code: string
      name: string
      nativeName: string
      direction: 'ltr' | 'rtl'
      defaultForTenant: boolean
    }>
    dateFormat: string
    timeFormat: string
  }
  
  integrations: {
    analytics: {
      googleAnalytics: string | null
      googleTagManager: string | null
      enabled: boolean
    }
    ads: {
      adsense: string | null
      enabled: boolean
    }
    push: {
      vapidPublicKey: string | null
      enabled: boolean
    }
    social: {
      facebookAppId: string | null
      twitterHandle: string | null
    }
  }
  
  features: {
    darkMode: boolean
    pwaPushNotifications: boolean
    commenting: boolean
    bookmarking: boolean
    sharing: boolean
    liveUpdates: boolean
    newsletter: boolean
    ePaper: boolean
    mobileApp: boolean
  }
  
  navigation: {
    header: {
      primaryMenu: Array<{
        label: string
        href: string
        icon: string | null
      }>
      utilityMenu: Record<string, unknown>[]
      showSearch: boolean
      showLanguageSwitcher: boolean
      sticky: {
        enabled: boolean
        offsetPx: number
      }
    }
    footer: {
      sections: Array<{
        title: string
        links: Array<{
          label: string
          href: string
        }>
      }>
      copyrightText: string
      showSocialLinks: boolean
    }
    mobile: {
      bottomNav: Array<{
        label: string
        href: string
        icon: string
      }>
      quickActions: Record<string, unknown>[]
    }
  }
  
  social: {
    facebook: string | null
    twitter: string | null
    instagram: string | null
    youtube: string | null
    telegram: string | null
    linkedin: string | null
    whatsapp: string | null
  }
  
  contact: {
    email: string | null
    phone: string | null
    address: {
      street: string | null
      city: string | null
      state: string | null
      country: string
      postalCode: string | null
    }
  }
  
  layout: {
    showTicker: boolean
    showTopBar: boolean
    showBreadcrumbs: boolean
    showReadingProgress: boolean
    articlesPerPage: number
  }
  
  admin: {
    name: string
    mobile: string
  }
  
  cacheControl: {
    config: number
    homepage: number
    article: number
    category: number
    staticPages: number
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

// Use cacheControl.config from API response, fallback to 1 hour
let CONFIG_TTL_MS = 3600 * 1000

function getCacheKey(domain: string): string {
  return `config:${domain}`
}

// ============================================================================
// Domain Detection
// ============================================================================

async function getTargetDomain(domainOverride?: string): Promise<string> {
  if (domainOverride) {
    return normalizeTenantDomain(domainOverride)
  }
  
  // ✅ ONLY read the custom header set by middleware
  const { getTenantDomain } = await import('@/lib/domain-utils')
  return getTenantDomain()
}

// ============================================================================
// API Fetcher
// ============================================================================

async function fetchConfig(tenantDomain: string): Promise<ConfigResult> {
  try {
    console.log(`🎯 [1st API] Calling /public/config | X-Tenant-Domain: ${tenantDomain}`)

    const config = await fetchJSON<TenantConfig>(`/public/config`, {
      tenantDomain,
      cache: 'no-store',
      // Config has its own in-memory TTL; always fetch fresh per request.
      next: { revalidate: 0 },
    })

    console.log(`✅ Config v${config.version} loaded for ${tenantDomain}:`, config.branding.siteName)
    
    // Update cache TTL from config
    if (config.cacheControl?.config) {
      CONFIG_TTL_MS = config.cacheControl.config * 1000
    }
    
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
  if (!config?.theme.colors.primary) return null
  return hexToHslTriplet(config.theme.colors.primary)
}

/**
 * Get secondary color in HSL format for CSS variables
 */
export function getSecondaryColorHSL(config: TenantConfig | null): string | null {
  if (!config?.theme.colors.secondary) return null
  return hexToHslTriplet(config.theme.colors.secondary)
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
  
  // Add header and footer background colors
  if (config?.theme.colors.headerBg) {
    vars['--header-bg'] = config.theme.colors.headerBg
  }
  if (config?.theme.colors.footerBg) {
    vars['--footer-bg'] = config.theme.colors.footerBg
  }
  
  // Add font family if available
  if (config?.theme.typography.fontFamily) {
    vars['--font-body'] = config.theme.typography.fontFamily
  }
  if (config?.theme.typography.fontFamilyHeadings) {
    vars['--font-heading'] = config.theme.typography.fontFamilyHeadings
  }
  
  return vars
}

/**
 * Check if analytics should be loaded
 */
export function shouldLoadAnalytics(config: TenantConfig | null): boolean {
  return !!(config?.integrations.analytics.googleAnalytics || config?.integrations.analytics.googleTagManager)
}

/**
 * Check if ads should be loaded
 */
export function shouldLoadAds(config: TenantConfig | null): boolean {
  return !!config?.integrations.ads.adsense
}

/**
 * Check if push notifications should be enabled
 */
export function shouldLoadPush(config: TenantConfig | null): boolean {
  return !!config?.integrations.push.vapidPublicKey
}

// ============================================================================
// Navigation & Layout Helpers
// ============================================================================

/**
 * Get primary menu items from config
 */
export function getPrimaryMenu(config: TenantConfig | null) {
  return config?.navigation.header.primaryMenu || []
}

/**
 * Get footer sections from config
 */
export function getFooterSections(config: TenantConfig | null) {
  return config?.navigation.footer.sections || []
}

/**
 * Get mobile bottom nav items from config
 */
export function getMobileBottomNav(config: TenantConfig | null) {
  return config?.navigation.mobile.bottomNav || []
}

/**
 * Get layout settings from config
 */
export function getLayoutSettings(config: TenantConfig | null) {
  return {
    showTicker: config?.layout.showTicker ?? true,
    showTopBar: config?.layout.showTopBar ?? true,
    showBreadcrumbs: config?.layout.showBreadcrumbs ?? true,
    showReadingProgress: config?.layout.showReadingProgress ?? true,
    articlesPerPage: config?.layout.articlesPerPage ?? 20,
  }
}

/**
 * Get social links from config (filtered to only active ones)
 */
export function getSocialLinks(config: TenantConfig | null) {
  if (!config) return []
  
  const links = []
  const social = config.social
  
  if (social.facebook) links.push({ platform: 'facebook', url: social.facebook })
  if (social.twitter) links.push({ platform: 'twitter', url: social.twitter })
  if (social.instagram) links.push({ platform: 'instagram', url: social.instagram })
  if (social.youtube) links.push({ platform: 'youtube', url: social.youtube })
  if (social.telegram) links.push({ platform: 'telegram', url: social.telegram })
  if (social.linkedin) links.push({ platform: 'linkedin', url: social.linkedin })
  if (social.whatsapp) links.push({ platform: 'whatsapp', url: social.whatsapp })
  
  return links
}

/**
 * Get contact info from config
 */
export function getContactInfo(config: TenantConfig | null) {
  return {
    email: config?.contact.email || null,
    phone: config?.contact.phone || null,
    address: config?.contact.address || null,
  }
}

/**
 * Get cache TTL for specific resource type
 */
export function getCacheTTL(config: TenantConfig | null, type: 'config' | 'homepage' | 'article' | 'category' | 'staticPages'): number {
  return config?.cacheControl[type] || 300 // Default 5 min
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

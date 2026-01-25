/**
 * SEO Homepage API Integration
 * Fetches JSON-LD structured data for Google/search engines
 */

import { headers } from 'next/headers'
import { cache as reactCache } from 'react'
import { normalizeTenantDomain } from './remote'

const API_BASE_URL = process.env.API_BASE_URL || 'https://app.kaburlumedia.com/api/v1'

// ============================================================================
// Types
// ============================================================================

export interface SEOHomepage {
  '@context': string
  '@graph': Array<SEOWebSite | SEOOrganization>
}

export interface SEOWebSite {
  '@type': 'WebSite'
  '@id': string
  url: string
  name: string
  description: string
  inLanguage: string
  potentialAction: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

export interface SEOOrganization {
  '@type': 'Organization'
  '@id': string
  name: string
  url: string
  logo: {
    '@type': 'ImageObject'
    url: string
    width: number
    height: number
  }
}

export interface SEOResult {
  data: SEOHomepage | null
  isError: boolean
  errorMessage?: string
}

// ============================================================================
// In-Memory Cache
// ============================================================================

type CacheEntry = { value: SEOResult; expires: number }
const cache = new Map<string, CacheEntry>()

// Use same TTL as config (1 hour)
const SEO_TTL_MS = 3600 * 1000

function getCacheKey(domain: string): string {
  return `seo:homepage:${domain}`
}

// ============================================================================
// Domain Detection
// ============================================================================

function domainFromHeaders(h: Headers): string {
  const host = h.get('host') || 'localhost'
  return normalizeTenantDomain(host)
}

async function getTargetDomain(domainOverride?: string): Promise<string> {
  // 🎯 SIMPLE: If HOST env is set, use it directly
  if (process.env.HOST) {
    return normalizeTenantDomain(process.env.HOST)
  }
  
  // Otherwise detect from request headers
  const h = await headers()
  return normalizeTenantDomain(domainOverride || h.get('host') || 'localhost')
}

// ============================================================================
// API Fetcher
// ============================================================================

async function fetchSEOHomepage(tenantDomain: string): Promise<SEOResult> {
  const url = `${API_BASE_URL}/public/seo/homepage`
  
  console.log(`🎯 [2nd API] Calling ${url} | X-Tenant-Domain: ${tenantDomain}`)
  
  try {
    const res = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'X-Tenant-Domain': tenantDomain,
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      console.error(`❌ SEO homepage API failed: ${res.status} ${res.statusText}`)
      return {
        data: null,
        isError: true,
        errorMessage: `HTTP ${res.status}: ${res.statusText}`,
      }
    }

    const data = await res.json() as SEOHomepage
    console.log(`✅ SEO homepage loaded for ${tenantDomain}`)
    
    return {
      data,
      isError: false,
    }
  } catch (error) {
    console.error('❌ SEO homepage API error:', error)
    return {
      data: null,
      isError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// Cached Getter (React Cache + Memory Cache)
// ============================================================================

const _getSEOResult = reactCache(async (domainOverride?: string): Promise<SEOResult> => {
  const domain = await getTargetDomain(domainOverride)
  const now = Date.now()
  const key = getCacheKey(domain)
  
  // Check memory cache
  const hit = cache.get(key)
  if (hit && hit.expires > now && !hit.value.isError) {
    console.log(`📦 SEO homepage cache hit for ${domain}`)
    return hit.value
  }

  // Fetch fresh
  const result = await fetchSEOHomepage(domain)
  
  // Cache successful results only
  if (!result.isError) {
    cache.set(key, {
      value: result,
      expires: now + SEO_TTL_MS,
    })
  }

  return result
})

// ============================================================================
// Public API
// ============================================================================

/**
 * Get SEO homepage structured data (primary method)
 * Uses domain from headers or environment
 */
export async function getSEOHomepage(): Promise<SEOHomepage | null> {
  const result = await _getSEOResult()
  return result.data
}

/**
 * Get SEO homepage for specific domain
 */
export async function getSEOHomepageForDomain(tenantDomain: string): Promise<SEOHomepage | null> {
  const result = await _getSEOResult(normalizeTenantDomain(tenantDomain))
  return result.data
}

/**
 * Get SEO result with error info
 */
export async function getSEOResult(): Promise<SEOResult> {
  return _getSEOResult()
}

/**
 * Get SEO result for specific domain
 */
export async function getSEOResultForDomain(tenantDomain: string): Promise<SEOResult> {
  return _getSEOResult(normalizeTenantDomain(tenantDomain))
}

/**
 * Generate JSON-LD script tag content
 */
export function generateJSONLD(seo: SEOHomepage): string {
  return JSON.stringify(seo, null, 0)
}

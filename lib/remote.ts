const API_BASE_URL = process.env.API_BASE_URL || 'https://app.kaburlumedia.com/api/v1'

const DEFAULT_REVALIDATE_SECONDS = Number(process.env.REMOTE_REVALIDATE_SECONDS || '30')

export function normalizeTenantDomain(host?: string | null) {
  const raw = String(host || 'localhost')
    .trim()
    .toLowerCase()
    .split(':')[0]
  if (raw.startsWith('www.')) return raw.slice(4)
  return raw
}

function getDomainFromHost(host?: string | null) {
  return normalizeTenantDomain(host)
}

type NextFetchOptions = {
  revalidate?: number
  tags?: string[]
}

type FetchJSONInit = Omit<RequestInit, 'headers'> & {
  tenantDomain?: string
  headers?: HeadersInit
  next?: NextFetchOptions
  revalidateSeconds?: number
  tags?: string[]
}

export async function fetchJSON<T>(path: string, init?: FetchJSONInit) {
  const url = `${API_BASE_URL}${path}`

  const {
    tenantDomain: tenantDomainFromInit,
    revalidateSeconds,
    tags,
    next: nextFromInit,
    cache: cacheFromInit,
    headers: headersFromInit,
    ...rest
  } = init ?? {}

  // Get tenant domain
  let tenantDomain = tenantDomainFromInit
  if (!tenantDomain) {
    if (typeof window === 'undefined') {
      // ✅ Server-side: Read ONLY the custom header set by middleware
      try {
        const { getTenantDomain } = await import('@/lib/domain-utils')
        tenantDomain = await getTenantDomain()
      } catch {
        console.error('❌ Failed to get tenant domain, falling back')
        tenantDomain = 'kaburlutoday.com'
      }
    } else {
      // ✅ Client-side: Read from window location (for client components)
      const hostname = window.location.hostname
      if (hostname === 'localhost') {
        // Localhost: use dev domain from env
        tenantDomain = getDomainFromHost(process.env.NEXT_PUBLIC_DEV_DOMAIN || 'kaburlutoday.com')
      } else {
        tenantDomain = getDomainFromHost(hostname)
      }
    }
  }

  const method = String(rest.method || 'GET').toUpperCase()
  const isCacheable = method === 'GET' || method === 'HEAD'
  
  // Don't set revalidation when cache is explicitly 'no-store'
  const shouldUseRevalidation = isCacheable && cacheFromInit !== 'no-store'

  const next: NextFetchOptions | undefined =
    nextFromInit ?? (shouldUseRevalidation ? { revalidate: revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS, tags } : (tags ? { tags } : undefined))

  console.log(`🌐 [API Call] ${method} ${url} | X-Tenant-Domain: ${tenantDomain}`)
  
  const res = await fetch(url, {
    ...rest,
    headers: {
      accept: 'application/json',
      ...(headersFromInit ?? {}),
      'X-Tenant-Domain': tenantDomain,
    },
    // Best-practice: cache GETs with revalidation to reduce TTFB and avoid repeated backend calls.
    cache: cacheFromInit ?? (isCacheable ? 'force-cache' : 'no-store'),
    next,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Remote API ${res.status} ${res.statusText} at ${path}: ${text}`)
  }
  return (await res.json()) as T
}

export interface EffectiveSettings {
  seo?: { ogImageUrl?: string; defaultMetaTitle?: string; defaultMetaDescription?: string; defaultMetaKeywords?: string; canonicalBaseUrl?: string }
  ads?: {
    enabled?: boolean
    debug?: boolean
    googleAdsense?: { client?: string }
    slots?: Record<
      string,
      {
        enabled?: boolean
        provider?: 'none' | 'local' | 'google'
        label?: string
        local?: { enabled?: boolean; imageUrl?: string; clickUrl?: string; alt?: string; logoUrl?: string }
        google?: { enabled?: boolean; client?: string; slot?: string; format?: string; responsive?: boolean }
      }
    >
  }
  theme?: {
    // Backend may send `theme` (current) or `key` (legacy)
    theme?: string
    key?: string
    colors?: { accent?: string; primary?: string; secondary?: string; headerBg?: string; footerBg?: string }
    typography?: { baseSize?: number; fontFamily?: string }
    layout?: { footer?: string; header?: string; showTicker?: boolean; showTopBar?: boolean; showBreadcrumbs?: boolean; showReadingProgress?: boolean; themeStyle?: string }
  }
  content?: { defaultLanguage?: string }
  branding?: { logoUrl?: string; faviconUrl?: string; siteName?: string; siteTagline?: string }
  contact?: {
    email?: string
    phone?: string
    city?: string
    region?: string
    country?: string
  }
  social?: {
    facebook?: string
    x?: string
    twitter?: string
    instagram?: string
    youtube?: string
    telegram?: string
    linkedin?: string
    whatsapp?: string
  }
  navigation?: {
    menu?: Array<{
      href?: string
      label?: string
      categorySlug?: string
      labels?: { base?: string; translated?: string }
      labelEn?: string
      labelNative?: string
    }>
    footer?: {
      sections?: Array<{
        title?: string
        links?: Array<{
          label?: string
          href?: string
        }>
      }>
      copyrightText?: string
      showSocialLinks?: boolean
    }
  }
  settings?: {
    seo?: { ogImageUrl?: string; defaultMetaTitle?: string; defaultMetaDescription?: string; defaultMetaKeywords?: string; canonicalBaseUrl?: string }
    ads?: {
      enabled?: boolean
      debug?: boolean
      googleAdsense?: { client?: string }
      slots?: Record<
        string,
        {
          enabled?: boolean
          provider?: 'none' | 'local' | 'google'
          label?: string
          local?: { enabled?: boolean; imageUrl?: string; clickUrl?: string; alt?: string; logoUrl?: string }
          google?: { enabled?: boolean; client?: string; slot?: string; format?: string; responsive?: boolean }
        }
      >
    }
    theme?: {
      theme?: string
      key?: string
      colors?: { accent?: string; primary?: string; secondary?: string; headerBg?: string; footerBg?: string }
      typography?: { baseSize?: number; fontFamily?: string }
      layout?: { footer?: string; header?: string; showTicker?: boolean; showTopBar?: boolean; showBreadcrumbs?: boolean; showReadingProgress?: boolean; themeStyle?: string }
    }
    content?: { defaultLanguage?: string }
    branding?: { logoUrl?: string; faviconUrl?: string; siteName?: string; siteTagline?: string }
    contact?: {
      email?: string
      phone?: string
      city?: string
      region?: string
      country?: string
    }
    social?: {
      facebook?: string
      x?: string
      twitter?: string
      instagram?: string
      youtube?: string
      telegram?: string
      linkedin?: string
      whatsapp?: string
    }
    navigation?: {
      menu?: Array<{
        href?: string
        label?: string
        categorySlug?: string
        labels?: { base?: string; translated?: string }
        labelEn?: string
        labelNative?: string
      }>
      footer?: {
        sections?: Array<{
          title?: string
          links?: Array<{
            label?: string
            href?: string
          }>
        }>
        copyrightText?: string
        showSocialLinks?: boolean
      }
    }
  }
  tenant?: {
    id?: string
    slug?: string
    name?: string
    displayName?: string
    nativeName?: string
  }
}

// DEPRECATED: Use getConfig() from lib/config.ts instead
// Old getDomainSettings removed - /public/domain/settings API no longer used

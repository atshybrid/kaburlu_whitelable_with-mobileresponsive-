const API_BASE_URL = process.env.API_BASE_URL || 'https://app.kaburlumedia.com/api/v1'

const DEFAULT_REVALIDATE_SECONDS = Number(process.env.REMOTE_REVALIDATE_SECONDS || '30')
const SETTINGS_REVALIDATE_SECONDS = Number(process.env.REMOTE_SETTINGS_REVALIDATE_SECONDS || '300')

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

  const tenantDomain =
    tenantDomainFromInit || getDomainFromHost(typeof window === 'undefined' ? process.env.HOST : window.location.hostname)

  const method = String(rest.method || 'GET').toUpperCase()
  const isCacheable = method === 'GET' || method === 'HEAD'

  const next: NextFetchOptions | undefined =
    nextFromInit ?? (isCacheable ? { revalidate: revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS, tags } : undefined)

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
  seo?: { ogImageUrl?: string; defaultMetaTitle?: string; defaultMetaDescription?: string; canonicalBaseUrl?: string }
  theme?: {
    // Backend may send `theme` (current) or `key` (legacy)
    theme?: string
    key?: string
    colors?: { accent?: string; primary?: string; secondary?: string }
    typography?: { baseSize?: number; fontFamily?: string }
    layout?: { footer?: string; header?: string; showTicker?: boolean; showTopBar?: boolean }
  }
  content?: { defaultLanguage?: string }
  branding?: { logoUrl?: string; faviconUrl?: string; siteName?: string }
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
    instagram?: string
    youtube?: string
    telegram?: string
  }
  settings?: {
    seo?: { ogImageUrl?: string; defaultMetaTitle?: string; defaultMetaDescription?: string; canonicalBaseUrl?: string }
    theme?: {
      theme?: string
      key?: string
      colors?: { accent?: string; primary?: string; secondary?: string }
      typography?: { baseSize?: number; fontFamily?: string }
      layout?: { footer?: string; header?: string; showTicker?: boolean; showTopBar?: boolean }
    }
    content?: { defaultLanguage?: string }
    branding?: { logoUrl?: string; faviconUrl?: string; siteName?: string }
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
      instagram?: string
      youtube?: string
      telegram?: string
    }
  }
}

export type DomainSettingsResponse = {
  domain: string
  tenantId: string
  effective: EffectiveSettings
}

export async function getDomainSettings(domain: string) {
  return fetchJSON<DomainSettingsResponse>('/public/domain/settings', {
    tenantDomain: domain,
    revalidateSeconds: Number.isFinite(SETTINGS_REVALIDATE_SECONDS) ? SETTINGS_REVALIDATE_SECONDS : 300,
    tags: [`domain-settings:${domain}`],
  })
}

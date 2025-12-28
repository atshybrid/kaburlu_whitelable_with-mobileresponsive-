const API_BASE_URL = process.env.API_BASE_URL || 'https://app.kaburlumedia.com/api/v1'

function getDomainFromHost(host?: string | null) {
  if (!host) return 'localhost'
  return host.split(':')[0]
}

export async function fetchJSON<T>(path: string, init?: RequestInit & { tenantDomain?: string }) {
  const url = `${API_BASE_URL}${path}`
  const tenantDomain = init?.tenantDomain || getDomainFromHost(typeof window === 'undefined' ? process.env.HOST : window.location.hostname)
  const res = await fetch(url, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init?.headers ?? {}),
      'X-Tenant-Domain': tenantDomain,
    },
    // Always fetch on server; opt-out of Next cache to reflect admin changes immediately.
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Remote API ${res.status} ${res.statusText} at ${path}: ${text}`)
  }
  return (await res.json()) as T
}

export interface EffectiveSettings {
  seo?: { ogImageUrl?: string; defaultMetaTitle?: string; defaultMetaDescription?: string; canonicalBaseUrl?: string }
  theme?: { layout?: { footer?: string; header?: string; showTicker?: boolean; showTopBar?: boolean }; key?: string }
  content?: { defaultLanguage?: string }
  branding?: { logoUrl?: string; faviconUrl?: string; siteName?: string }
  settings?: {
    seo?: { ogImageUrl?: string; defaultMetaTitle?: string; defaultMetaDescription?: string; canonicalBaseUrl?: string }
    theme?: { layout?: { footer?: string; header?: string; showTicker?: boolean; showTopBar?: boolean } }
    content?: { defaultLanguage?: string }
    branding?: { logoUrl?: string; faviconUrl?: string; siteName?: string }
  }
}

export type DomainSettingsResponse = {
  domain: string
  tenantId: string
  effective: EffectiveSettings
}

export async function getDomainSettings(domain: string) {
  return fetchJSON<DomainSettingsResponse>('/public/domain/settings', { tenantDomain: domain })
}

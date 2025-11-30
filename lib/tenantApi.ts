// Tenant-aware API client for the frontend (SSR + Client)
// Best practices:
// - Use relative /api base so Host header determines tenant (via Next.js rewrite)
// - Provide optional ISR via `revalidate`, else default to no-store for freshness
// - Small typed surface with clear errors

export type TenantTheme = {
  id: string
  tenantId: string
  logoUrl?: string | null
  faviconUrl?: string | null
  primaryColor?: string | null
  headerHtml?: string | null
  createdAt: string
  updatedAt: string
}

export type CategoryItem = {
  id: string
  name: string
  slug: string
  parentId?: string | null
  iconUrl?: string | null
}

export type ArticleItem = {
  id: string
  title: string
  shortNews?: string | null
  longNews?: string | null
  headlines?: string | null
  type?: string | null
  author?: { id: string; mobileNumber?: string | null } | null
  language?: { id: string; code: string } | null
  tenant?: { id: string; slug: string } | null
  categories?: { id: string; name: string; slug: string }[] | null
  tags?: string[] | null
  images?: string[] | null
  isBreakingNews?: boolean
  isTrending?: boolean
  viewCount?: number
  createdAt: string
  updatedAt: string
  content?: string | null
  contentJson?: unknown
}

export type ArticleListResponse = {
  page: number
  pageSize: number
  total: number
  items: ArticleItem[]
}

// Domain settings (multi-tenant) shape based on backend example
export type DomainSettingsResponse = {
  domain: string
  tenantId: string
  effective: {
    seo?: {
      ogImageUrl?: string
      canonicalBaseUrl?: string
      defaultMetaTitle?: string
      defaultMetaDescription?: string
    }
    theme?: {
      layout?: {
        footer?: string
        header?: string
        showTicker?: boolean
        showTopBar?: boolean
      }
    }
    content?: {
      defaultLanguage?: string
    }
    branding?: {
      logoUrl?: string
      faviconUrl?: string
    }
    settings?: {
      seo?: DomainSettingsResponse['effective']['seo']
      theme?: DomainSettingsResponse['effective']['theme']
      content?: DomainSettingsResponse['effective']['content']
      branding?: DomainSettingsResponse['effective']['branding']
    }
  }
}

export type ApiOptions = {
  // Freshness controls
  cache?: RequestCache
  revalidate?: number
  // Networking
  signal?: AbortSignal
  headers?: Record<string, string>
  // Preview-only header to emulate a tenant on non-mapped domains
  previewTenantDomain?: string
}

function qs(params: Record<string, any> | undefined) {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

async function apiFetch<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { cache, revalidate, signal, headers, previewTenantDomain } = opts
  const init: RequestInit = { headers: { ...(headers || {}) }, signal }
  if (previewTenantDomain) {
    (init.headers as Record<string, string>)['X-Tenant-Domain'] = previewTenantDomain
  }
  // Prefer ISR when revalidate provided; else default to no-store for dynamic pages
  if (typeof revalidate === 'number') {
    ;(init as any).next = { revalidate }
  } else if (cache) {
    init.cache = cache
  } else {
    init.cache = 'no-store'
  }
  const res = await fetch(`/api${path.startsWith('/') ? '' : '/'}${path}`, init)
  if (!res.ok) {
    let msg = `API ${res.status} ${res.statusText}`
    try { const j = await res.json(); msg += `: ${j?.message || j?.error || ''}` } catch {}
    const err: any = new Error(msg)
    err.status = res.status
    throw err
  }
  return res.json() as Promise<T>
}

// Public Website APIs

export async function getTheme(opts?: ApiOptions) {
  return apiFetch<TenantTheme>('/public/theme', opts)
}

export async function getCategories(params?: { languageCode?: string; includeChildren?: boolean }, opts?: ApiOptions) {
  return apiFetch<CategoryItem[]>(`/public/categories${qs(params)}`, opts)
}

export async function listArticles(params?: { categorySlug?: string; page?: number; pageSize?: number; languageCode?: string }, opts?: ApiOptions) {
  return apiFetch<ArticleListResponse>(`/public/articles${qs(params)}`, opts)
}

export async function getArticle(slugOrId: string, opts?: ApiOptions) {
  return apiFetch<ArticleItem>(`/public/articles/${encodeURIComponent(slugOrId)}`, opts)
}

// Multi-tenant domain settings: resolves theme/seo/branding per request domain.
// Use previewTenantDomain in opts on non-mapped preview domains.
export async function getDomainSettings(opts?: ApiOptions) {
  return apiFetch<DomainSettingsResponse>(`/public/domain/settings`, opts)
}

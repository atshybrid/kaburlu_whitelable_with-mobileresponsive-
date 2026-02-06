import { headers } from 'next/headers'
import { fetchJSON } from './remote'
import { getEffectiveSettings } from './settings'

export interface Category {
  id: string
  name: string
  nameDefault?: string
  nameLocalized?: string
  slug: string
  parentId?: string | null
  iconUrl?: string | null
  children?: Category[]
}

type CategoryTranslationRow = {
  id: string
  baseName: string
  slug: string
  translated?: string | null
  hasTranslation?: boolean
  domainLanguageEnabled?: boolean
  tenantDefaultLanguage?: string | null
}

type CacheEntry = { value: Category[]; expires: number }
const cache = new Map<string, CacheEntry>()
const TTL_MS = 60 * 1000

function getDomain(h: Headers) {
  // 🎯 SIMPLE: If HOST env is set, use it directly
  if (process.env.HOST) {
    return process.env.HOST.split(':')[0]
  }

  // Prefer the tenant header injected by `proxy.ts`/middleware (works on localhost)
  const fromProxy = h.get('x-tenant-domain') || h.get('X-Tenant-Domain')
  if (fromProxy) return String(fromProxy).split(':')[0]

  const host = h.get('host') || 'localhost'
  return host.split(':')[0]
}

export async function getCategoriesForNav(): Promise<Category[]> {
  const h = await headers()
  const domain = getDomain(h)
  const settings = await getEffectiveSettings()
  const lang = settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'en'
  const key = `categories:${domain}:${lang}`
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && hit.expires > now) return hit.value

  const languageCode = String(lang || 'en')

  // Always fetch categories (includeChildren) so we preserve parentId/children for sub-navigation.
  // Then, for non-English tenants, optionally overlay names from translations.
  const qs = new URLSearchParams({ includeChildren: 'true', languageCode })

  let categories: Category[] = []
  try {
    const res = await fetchJSON<Category[]>(`/public/categories?${qs.toString()}`, {
      tenantDomain: domain,
      revalidateSeconds: Number(process.env.REMOTE_CATEGORIES_REVALIDATE_SECONDS || '300'),
      tags: [`categories:${domain}:${languageCode}`],
    })
    // Ensure name is always a string (might be an object from API)
    const extractName = (val: unknown): string => {
      if (typeof val === 'string') return val
      if (val && typeof val === 'object' && 'name' in val) return String((val as { name?: unknown }).name || '')
      return ''
    }
    // Map nameLocalized to name for display (nameLocalized is Telugu name)
    categories = Array.isArray(res) ? res.map(cat => ({
      ...cat,
      name: extractName(cat.nameLocalized) || extractName(cat.nameDefault) || extractName(cat.name) || cat.slug
    })) : []
  } catch {
    categories = []
  }

  if (languageCode.toLowerCase() !== 'en') {
    const translationsQs = new URLSearchParams({ languageCode })
    try {
      const translated = await fetchJSON<CategoryTranslationRow[]>(
        `/public/category-translations?${translationsQs.toString()}`,
        {
          tenantDomain: domain,
          revalidateSeconds: Number(process.env.REMOTE_CATEGORY_TRANSLATIONS_REVALIDATE_SECONDS || '300'),
          tags: [`category-translations:${domain}:${languageCode}`],
        }
      )
      const rows = Array.isArray(translated) ? translated : []
      const enabled = rows.filter((r) => r && r.domainLanguageEnabled !== false)
      if (enabled.length > 0) {
        const bySlug = new Map<string, string>()
        for (const r of enabled) {
          const slug = String(r.slug || '').trim()
          if (!slug) continue
          // Handle name that might be an object
          let name = ''
          if (r.hasTranslation && r.translated) {
            name = typeof r.translated === 'string' ? r.translated : String(r.translated || '')
          } else if (r.baseName) {
            name = typeof r.baseName === 'string' ? r.baseName : String(r.baseName || '')
          } else {
            name = slug
          }
          if (name) bySlug.set(slug, name)
        }

        const applyNames = (list: Category[]) => {
          for (const c of list) {
            const translatedName = c?.slug ? bySlug.get(String(c.slug)) : undefined
            if (translatedName) c.name = translatedName
            if (Array.isArray(c.children) && c.children.length > 0) applyNames(c.children)
          }
        }
        if (categories.length > 0) applyNames(categories)
      }
    } catch {
      // ignore; keep category names from /public/categories
    }
  }

  if (categories.length > 0) {
    cache.set(key, { value: categories, expires: now + TTL_MS })
    return categories
  }

  // Last resort: translation-only fallback (flat, no hierarchy)
  if (languageCode.toLowerCase() !== 'en') {
    const translationsQs = new URLSearchParams({ languageCode })
    try {
      const translated = await fetchJSON<CategoryTranslationRow[]>(`/public/category-translations?${translationsQs.toString()}`, {
        tenantDomain: domain,
        revalidateSeconds: Number(process.env.REMOTE_CATEGORY_TRANSLATIONS_REVALIDATE_SECONDS || '300'),
        tags: [`category-translations:${domain}:${languageCode}`],
      })
      const rows = Array.isArray(translated) ? translated : []
      const enabled = rows.filter((r) => r && r.domainLanguageEnabled !== false)
      if (enabled.length > 0) {
        const mapped: Category[] = enabled.map((r) => ({
          id: String(r.id),
          slug: String(r.slug),
          name: r.hasTranslation && r.translated ? String(r.translated) : String(r.baseName || r.slug),
        }))
        cache.set(key, { value: mapped, expires: now + TTL_MS })
        return mapped
      }
    } catch {
      // ignore
    }
  }

  const mock = makeMockCategories()
  cache.set(key, { value: mock, expires: now + TTL_MS })
  return mock
}

function makeMockCategories(): Category[] {
  // Telugu categories - Only REAL categories, NOT feed types like 'latest' or 'breaking'
  // 'latest' and 'breaking' are feed types used only for hero section, not for category sections
  return [
    { id: 'cat-politics', name: 'రాజకీయాలు', slug: 'political' },
    { id: 'cat-sports', name: 'క్రీడలు', slug: 'sports' },
    { id: 'cat-entertainment', name: 'వినోదం', slug: 'entertainment' },
    { id: 'cat-business', name: 'వ్యాపారం', slug: 'business' },
    { id: 'cat-crime', name: 'నేరాలు', slug: 'crime' },
    { id: 'cat-lifestyle', name: 'జీవనశైలి', slug: 'lifestyle' },
    { id: 'cat-health', name: 'ఆరోగ్యం', slug: 'health' },
    { id: 'cat-education', name: 'విద్య', slug: 'education' },
    { id: 'cat-world', name: 'ప్రపంచం', slug: 'world' },
    { id: 'cat-tech', name: 'టెక్నాలజీ', slug: 'technology' },
    { id: 'cat-national', name: 'జాతీయం', slug: 'national' },
  ]
}

import { headers } from 'next/headers'
import { fetchJSON } from './remote'
import { getEffectiveSettings } from './settings'

export interface Category {
  id: string
  name: string
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
  const host = h.get('host') || 'localhost'
  return host.split(':')[0]
}

export async function getCategoriesForNav(): Promise<Category[]> {
  const h = await headers()
  const domain = getDomain(h)
  const settings = await getEffectiveSettings()
  const lang = settings?.content?.defaultLanguage || 'en'
  const key = `categories:${domain}:${lang}`
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && hit.expires > now) return hit.value

  const languageCode = String(lang || 'en')

  // Prefer translations endpoint when a domain language is configured.
  // Backend may still return English if translation is missing; we fall back gracefully.

  // Avoid extra requests when English is used.
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
      // ignore; fall back
    }
  }

  const qs = new URLSearchParams({ includeChildren: 'true', languageCode })
  try {
    const res = await fetchJSON<Category[]>(`/public/categories?${qs.toString()}`, {
      tenantDomain: domain,
      revalidateSeconds: Number(process.env.REMOTE_CATEGORIES_REVALIDATE_SECONDS || '300'),
      tags: [`categories:${domain}:${languageCode}`],
    })
    const flat = Array.isArray(res) ? res : []
    if (flat.length > 0) {
      cache.set(key, { value: flat, expires: now + TTL_MS })
      return flat
    }
  } catch {
    // ignore
  }

  const mock = makeMockCategories()
  cache.set(key, { value: mock, expires: now + TTL_MS })
  return mock
}

function makeMockCategories(): Category[] {
  return [
    { id: 'mock-politics', name: 'Politics', slug: 'politics' },
    { id: 'mock-business', name: 'Business', slug: 'business' },
    { id: 'mock-sports', name: 'Sports', slug: 'sports' },
    { id: 'mock-entertainment', name: 'Entertainment', slug: 'entertainment' },
    { id: 'mock-tech', name: 'Technology', slug: 'technology' },
    { id: 'mock-health', name: 'Health', slug: 'health' },
  ]
}

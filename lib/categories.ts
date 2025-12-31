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
    categories = Array.isArray(res) ? res : []
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
          const name = r.hasTranslation && r.translated ? String(r.translated) : String(r.baseName || r.slug)
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
  return [
    { id: 'mock-politics', name: 'Politics', slug: 'politics' },
    { id: 'mock-business', name: 'Business', slug: 'business' },
    { id: 'mock-sports', name: 'Sports', slug: 'sports' },
    { id: 'mock-entertainment', name: 'Entertainment', slug: 'entertainment' },
    { id: 'mock-tech', name: 'Technology', slug: 'technology' },
    { id: 'mock-health', name: 'Health', slug: 'health' },
  ]
}

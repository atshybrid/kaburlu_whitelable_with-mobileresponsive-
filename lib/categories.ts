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

  const qs = new URLSearchParams({ includeChildren: 'true', languageCode: String(lang) })
  try {
    const res = await fetchJSON<Category[]>(`/public/categories?${qs.toString()}`, { tenantDomain: domain })
    const flat = Array.isArray(res) ? res : []
    if (flat.length > 0) {
      cache.set(key, { value: flat, expires: now + TTL_MS })
      return flat
    }
    const mock = makeMockCategories()
    cache.set(key, { value: mock, expires: now + TTL_MS })
    return mock
  } catch {
    const mock = makeMockCategories()
    cache.set(key, { value: mock, expires: now + TTL_MS })
    return mock
  }
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

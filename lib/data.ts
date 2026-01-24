import { getDataSource, type Article } from './data-sources'
import { getTenantFromHeaders } from './tenant'

function isMockMode() {
  const v = String(process.env.MOCK_DATA || '').toLowerCase()
  return v === '1' || v === 'true' || v === 'yes' || v === 'on'
}

function allowMockFallback() {
  // Never show mock/demo content in production unless explicitly enabled.
  if (isMockMode()) return true
  return process.env.NODE_ENV !== 'production'
}

export async function getHomeFeed(tenantId: string) {
  void tenantId
  const tenant = await getTenantFromHeaders()
  const ds = getDataSource()

  if (allowMockFallback()) return makeMockArticles({ count: 12, tenantSlug: tenant.slug })

  try {
    const list = await ds.homeFeed(tenant.slug, tenant.id)
    if (Array.isArray(list) && list.length > 0) return list
    return []
  } catch {
    return []
  }
}

export async function getArticleBySlug(tenantId: string, slug: string) {
  void tenantId
  const tenant = await getTenantFromHeaders()
  const ds = getDataSource()
  try {
    const item = await ds.articleBySlug(tenant.slug, slug, tenant.id)
    if (item) return item
  } catch {
    // ignore; fall back below when appropriate
  }

  // If the UI is showing mock articles (empty backend / mock mode), avoid 404s when clicking.
  const looksLikeMockSlug = /^sample-\d+$/i.test(slug) || /-sample-\d+$/i.test(slug) || slug.startsWith('dummy-')
  if (allowMockFallback() && looksLikeMockSlug) return makeMockArticle({ slug, tenantSlug: tenant.slug })
  return null
}

export async function getArticlesByCategory(tenantId: string, categorySlug: string) {
  void tenantId
  const tenant = await getTenantFromHeaders()
  const ds = getDataSource()

  if (allowMockFallback()) return makeMockArticles({ count: 12, tenantSlug: tenant.slug, categorySlug })

  try {
    const list = await ds.articlesByCategory(tenant.slug, categorySlug, tenant.id)
    if (Array.isArray(list) && list.length > 0) return list
    return []
  } catch {
    return []
  }
}

function coverForSeed(seed: string) {
  // External placeholder image source for development.
  // If you prefer local images later, swap this function.
  const safe = encodeURIComponent(seed)
  return `https://picsum.photos/seed/kaburlu-${safe}/1200/675`
}

function mockContentHtml(title: string) {
  return [
    `<p><strong>${escapeHtml(title)}</strong> — this is mock article content used for theme development.</p>`,
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
    '<h2>Key Points</h2>',
    '<ul><li>Realistic headings and lists</li><li>Multiple paragraphs to test spacing</li><li>Works with all theme article pages</li></ul>',
    '<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>',
  ].join('')
}

function escapeHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function makeMockArticle({ slug, tenantSlug }: { slug: string; tenantSlug: string }): Article {
  const n = Number((slug.match(/(\d+)$/) || [])[1] || 1)
  const title = `Mock Headline ${n}: ${tenantSlug.toUpperCase()} Updates`
  return {
    id: `dummy-${slug}`,
    slug,
    title,
    excerpt: 'Mock excerpt: quick summary text for cards and listings.',
    content: mockContentHtml(title),
    coverImage: { url: coverForSeed(slug) },
    publishedAt: new Date(Date.now() - n * 60 * 60 * 1000).toISOString(),
    author: { name: 'Kaburlu Reporter' },
  }
}

function makeMockArticles({
  count,
  tenantSlug,
  categorySlug,
}: {
  count: number
  tenantSlug: string
  categorySlug?: string
}): Article[] {
  const items: Article[] = []
  for (let i = 0; i < count; i++) {
    const slug = categorySlug ? `${categorySlug}-sample-${i + 1}` : `sample-${i + 1}`
    const a = makeMockArticle({ slug, tenantSlug })
    items.push({
      ...a,
      title: categorySlug ? `Mock ${categorySlug}: ${a.title}` : a.title,
      categories: categorySlug
        ? [{ category: { slug: categorySlug, name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()) } }]
        : undefined,
    })
  }
  return items
}

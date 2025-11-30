# Tenant-aware API integration guide (frontend)

This short guide shows how your Next.js frontend should call the backend through the website's own domain so all requests are tenant-aware. Copy the examples directly.

## 1) Call the API via your website domain

Use relative paths so requests go to the same domain (tenant resolved by Host header automatically):

```ts
// Examples (client or server)
await fetch('/api/public/categories?languageCode=te')
await fetch('/api/public/theme')
await fetch('/api/public/_health')
```

No extra headers are required in production. No CORS issues.

## 2) Configure a rewrite to your backend

Add a rewrite so `/api/*` on your website proxies to your backend cluster.

- Next.js (preferred): `next.config.js`

```js
// next.config.js
module.exports = {
  async rewrites() {
    const origin = process.env.BACKEND_ORIGIN || 'https://app.kaburlumedia.com'
    return [
      { source: '/api/:path*', destination: `${origin.replace(/\/$/, '')}/api/:path*` },
    ]
  },
}
```

- Or Vercel: `vercel.json`

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://app.kaburlumedia.com/api/:path*" }
  ]
}
```

After this, calls to `https://your-tenant.com/api/...` are proxied to the backend automatically.

Tip for previews: when testing on a `*.vercel.app` preview that isn’t mapped to a tenant domain, either use your real domain to test tenant behavior, or temporarily add a header: `X-Tenant-Domain: your-tenant.com`.

## 3) Public Website APIs

These endpoints are tenant-aware (resolved by request domain).

### Get theme
GET `/api/public/theme`

Response fields (TenantTheme): `id, tenantId, logoUrl, faviconUrl, primaryColor, headerHtml, createdAt, updatedAt`

```ts
const theme = await fetch('/api/public/theme', { cache: 'no-store' }).then(r => r.json())
```

### Get categories
GET `/api/public/categories?languageCode=te&includeChildren=true`

Query:
- `languageCode` (optional)
- `includeChildren` (optional)

```ts
const cats = await fetch('/api/public/categories?languageCode=te').then(r => r.json())
```

Item shape: `{ id, name, slug, parentId, iconUrl }`

### List articles (listing pages)
GET `/api/public/articles?categorySlug={slug}&page=1&pageSize=20&languageCode=te`

Query:
- `categorySlug` (optional)
- `page` (default 1)
- `pageSize` (default 20, max 100)
- `languageCode` (optional)

```ts
const res = await fetch('/api/public/articles?categorySlug=politics&page=1&pageSize=20&languageCode=te', { cache: 'no-store' })
const { items, total } = await res.json()

// Build cards
const cards = items.map(a => ({
  id: a.id,
  title: a.title,
  image: a.images?.[0] ?? null,
  excerpt: a.shortNews ?? null,
  category: a.categories?.[0]?.slug ?? null,
  createdAt: a.createdAt,
}))
```

Response item (partial):
```ts
{
  id, title, content, shortNews, longNews, headlines, type,
  author: { id, mobileNumber },
  language: { id, code } | null,
  tenant: { id, slug },
  categories: [{ id, name, slug }],
  tags, images, isBreakingNews, isTrending,
  viewCount, createdAt, updatedAt,
  contentJson
}
```

### Article detail
GET `/api/public/articles/{slug}`

```ts
const article = await fetch('/api/public/articles/some-article-slug', { cache: 'no-store' }).then(r => r.json())
```

Note: today slug may match by title or id as fallback. If you want a dedicated `article.slug` field, ask backend to add it and we’ll update.

### Health check
GET `/api/public/_health`

```ts
await fetch('/api/public/_health')
```

## 4) Using fetch or Axios in Next.js

Using fetch (RSC or client):
```ts
export async function getCategories(lang = 'te') {
  const res = await fetch(`/api/public/categories?languageCode=${lang}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load categories')
  return res.json()
}
```

Using Axios:
```ts
import axios from 'axios'
const api = axios.create({ baseURL: '/api' })
const { data } = await api.get('/public/articles', {
  params: { categorySlug: 'politics', page: 1, pageSize: 20, languageCode: 'te' },
})
```

In a React Server Component with absolute base (optional):
```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/public/theme`, { cache: 'no-store' })
const theme = await res.json()
```

Caching tips:
- Use `{ cache: 'no-store' }` for always-fresh data.
- Or `next: { revalidate: N }` to ISR-revalidate.

### Or use the provided typed client (best practice)

`lib/tenantApi.ts` exposes small helpers with sensible defaults (no-store by default, optional `revalidate`, and a preview tenant header when needed):

```ts
import { getTheme, getCategories, listArticles, getArticle } from '../lib/tenantApi'

// Theme
const theme = await getTheme()

// Categories in Telugu
const cats = await getCategories({ languageCode: 'te' })

// List articles with pagination
const { items, total } = await listArticles({ categorySlug: 'politics', page: 1, pageSize: 20, languageCode: 'te' })

// Article detail
const article = await getArticle('some-article-slug')

// For ISR instead of no-store:
const cached = await listArticles({ categorySlug: 'world' }, { revalidate: 120 })

// On non-mapped preview domains, emulate tenant:
const previewItems = await listArticles({ page: 1, pageSize: 10 }, { previewTenantDomain: 'kaburlumedia.com' })
```

### Feature toggles example: mobile app view

- Flag: `features.enableMobileAppView` (or env `NEXT_PUBLIC_ENABLE_MOBILE_APP_VIEW`).
- When `true`, small screens render the swipe-style card stack (`MobileCardStack`).
- When `false`, the classic web layout becomes responsive on mobile (no card stack).
- Frontend helper: `isMobileAppViewEnabled()` from `lib/site.ts`.

## 5) Language handling

- Pass `languageCode` when you want localized data, e.g., `te`.
- Language must be allowed for the domain; otherwise articles return 0 and category names may be untranslated.

## 6) Errors and edge cases

- 404 Not found: article missing, not published, or filtered by tenant/language/category.
- 500 Domain context missing: host isn’t mapped to a tenant/domain.
  - Use your real custom domain, add a preview mapping, or temporarily set header `X-Tenant-Domain: kaburlumedia.com` during testing.
- Pagination: validate `page` and `pageSize` (max 100) in UI.

## 7) Frontend checklist

- [x] Add rewrite (Next config or Vercel).
- [x] Use relative `/api/...` calls in code.
- [x] Start with:
  - Theme for header/footer
  - Categories for navbar
  - Article list for home/category
  - Article detail for reader
- [x] Browser test endpoints:
  - `/api/public/_health`
  - `/api/public/theme`
  - `/api/public/categories?languageCode=te`
  - `/api/public/articles?categorySlug=politics&page=1&pageSize=20`

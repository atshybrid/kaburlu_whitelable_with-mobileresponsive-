# Production-Grade Multi-Tenant Architecture

## ✅ ARCHITECTURE OVERVIEW

This is a **SaaS-grade, domain-based multi-tenant** Next.js application following enterprise best practices.

### Core Principles

1. **Middleware = Single Source of Truth** for tenant resolution
2. **Production uses ONLY HTTP Host header** (no env variables)
3. **Custom headers** pass tenant info downstream
4. **Clean separation** of concerns (middleware → pages → API)
5. **SEO-safe** server-side rendering

---

## 🏗️ ARCHITECTURE LAYERS

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: Browser Request                                     │
│ GET https://kaburlutoday.com/article/some-news              │
│ Headers: { Host: "kaburlutoday.com" }                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: Middleware (middleware.ts)                          │
│ ✅ Reads: request.headers.get('host')                       │
│ ✅ Normalizes: "kaburlutoday.com"                           │
│ ✅ Sets: x-tenant-domain = "kaburlutoday.com"              │
│ ✅ Rewrites: /article/some-news → /t/kaburlu-today/article/│
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: Page/Layout Components                              │
│ ✅ Reads: headers().get('x-tenant-domain')                  │
│ ❌ NEVER reads: headers().get('host')                       │
│ Uses: getTenantDomain() helper                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 4: Backend API Calls                                   │
│ ✅ Header: X-Tenant-Domain = "kaburlutoday.com"            │
│ fetch(API_URL, {                                              │
│   headers: { 'X-Tenant-Domain': tenantDomain }              │
│ })                                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 5: Backend Response                                    │
│ Returns tenant-specific data                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 IMPLEMENTATION DETAILS

### 1. Middleware (middleware.ts)

**Responsibilities:**
- Read HTTP `Host` header (**ONLY place in app that does this**)
- Normalize domain (remove www, port)
- Set custom header: `x-tenant-domain`
- Rewrite URLs for clean public routes

**Code:**
```typescript
export function middleware(request: NextRequest) {
  // 1. Read Host header
  const rawHost = request.headers.get('host') || ''
  const normalizedHost = normalizeDomain(rawHost)
  
  // 2. Determine tenant domain
  let tenantDomain: string
  if (normalizedHost === 'localhost') {
    tenantDomain = process.env.NEXT_PUBLIC_DEV_DOMAIN || 'kaburlutoday.com'
  } else {
    tenantDomain = normalizedHost // Production
  }
  
  // 3. Set custom header
  response.headers.set('x-tenant-domain', tenantDomain)
  
  return response
}
```

### 2. Domain Detection Helper (lib/domain-utils.ts)

**Purpose:** Provide clean API for pages/layouts to get tenant domain

**Code:**
```typescript
export async function getTenantDomain(): Promise<string> {
  const h = await headers()
  return h.get('x-tenant-domain') || 'kaburlutoday.com'
}
```

**Usage in pages:**
```typescript
// ✅ CORRECT
import { getTenantDomain } from '@/lib/domain-utils'

export default async function Page() {
  const tenantDomain = await getTenantDomain()
  // Use for API calls
}

// ❌ WRONG - Never do this
const h = await headers()
const host = h.get('host') // ❌ NO!
```

### 3. Backend API Calls (lib/remote.ts)

**All API calls must include `X-Tenant-Domain` header:**

```typescript
export async function fetchJSON(path: string) {
  const tenantDomain = await getTenantDomain()
  
  return fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'X-Tenant-Domain': tenantDomain, // ✅ Required
      'Accept': 'application/json',
    }
  })
}
```

---

## 🌍 ENVIRONMENT VARIABLES

### Localhost (.env.local)
```bash
# Development fallback (localhost ONLY)
NEXT_PUBLIC_DEV_DOMAIN=kaburlutoday.com

# Backend API
API_BASE_URL=https://app.kaburlumedia.com/api/v1
DATA_SOURCE=remote
MULTITENANT_MODE=domain
```

### Vercel Production
```bash
# ✅ REQUIRED
API_BASE_URL=https://app.kaburlumedia.com/api/v1
DATA_SOURCE=remote
MULTITENANT_MODE=domain

# ❌ DO NOT SET (breaks production)
# HOST=...
# NEXT_PUBLIC_HOST=...
# NEXT_PUBLIC_DEV_DOMAIN=... (not needed in prod)
```

---

## 🧪 TESTING

### Localhost
```bash
# Visit: http://localhost:3000/article/some-news
# Expected: Uses NEXT_PUBLIC_DEV_DOMAIN="kaburlutoday.com"
# Console: X-Tenant-Domain: kaburlutoday.com
```

### Production
```bash
# Visit: https://kaburlutoday.com/article/some-news
# Expected: Detects from Host header
# Console: X-Tenant-Domain: kaburlutoday.com

# Visit: https://m4news.in/article/some-news  
# Expected: Detects from Host header
# Console: X-Tenant-Domain: m4news.in
```

---

## ✅ BEST PRACTICES FOLLOWED

1. ✅ **Single Responsibility**: Middleware handles tenant resolution only
2. ✅ **No Direct Header Access**: Pages/layouts never read `host`
3. ✅ **Production-First**: Works without env variables in prod
4. ✅ **Type Safety**: TypeScript throughout
5. ✅ **SEO Safe**: Pure SSR, no client-side hacks
6. ✅ **Scalable**: Can handle 100+ tenants
7. ✅ **Vercel Optimized**: Works with edge runtime
8. ✅ **Clean URLs**: No tenant slug in public URLs

---

## ❌ ANTI-PATTERNS REMOVED

1. ❌ `process.env.HOST` deciding tenant in production
2. ❌ `window.location.host` for SSR
3. ❌ Reading `headers().get('host')` in pages
4. ❌ Query params for tenant selection
5. ❌ Path-based tenancy in URLs

---

## 🚀 DEPLOYMENT CHECKLIST

### Vercel Dashboard
1. Go to: Settings → Environment Variables
2. Set these 3 variables for **all environments**:
   - `API_BASE_URL`
   - `DATA_SOURCE`
   - `MULTITENANT_MODE`
3. **Delete** if exists:
   - `HOST`
   - `NEXT_PUBLIC_HOST`
4. Save and redeploy

### Domain Configuration
1. Add custom domains in Vercel:
   - kaburlutoday.com
   - m4news.in
   - prashnaayudham.com
   - etc.
2. Verify DNS records pointing to Vercel
3. Test each domain

---

## 🔍 DEBUGGING

### Check Middleware
```typescript
// middleware.ts
console.log('Host:', request.headers.get('host'))
console.log('Tenant Domain:', tenantDomain)
```

### Check Page
```typescript
// page.tsx
const tenantDomain = await getTenantDomain()
console.log('Page sees tenant:', tenantDomain)
```

### Check API Calls
```bash
# Browser DevTools → Network → Headers
X-Tenant-Domain: kaburlutoday.com
```

---

## 📚 REFERENCES

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Multi-Tenancy Patterns](https://vercel.com/docs/concepts/solutions/multi-tenant-applications)
- [SaaS Architecture Best Practices](https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/multi-tenant-architecture.html)

---

**Status**: ✅ Production-Ready  
**Architecture**: SaaS-Grade  
**Scalability**: 100+ Tenants  
**SEO**: Fully Optimized

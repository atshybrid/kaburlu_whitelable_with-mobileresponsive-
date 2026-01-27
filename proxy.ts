import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * PRODUCTION-GRADE MULTI-TENANT PROXY
 * ====================================
 * 
 * SINGLE SOURCE OF TRUTH for tenant resolution
 * 
 * Rules:
 * 1. Production: ONLY uses request Host header
 * 2. Localhost: Falls back to NEXT_PUBLIC_DEV_DOMAIN env
 * 3. Sets custom header: x-tenant-domain
 * 4. Pages/layouts NEVER read Host directly
 * 5. Backend API uses X-Tenant-Domain header
 */

// Domain to tenant slug mapping
// ⚠️ CRITICAL: These MUST match backend tenant.slug exactly!
const DOMAIN_TO_TENANT: Record<string, string> = {
  'kaburlutoday.com': 'kaburlu-today',
  'm4news.in': 'manoranjani-telugu-times',
  'prashnaayudham.com': 'prashna-ayudham',
  'daxintimes.com': 'daxin-times',
  'kurnoolnews.com': 'kurnool-news', // Verify if this tenant exists in backend
  'chrnews.com': 'crown-human-rights',
}

/**
 * Normalize domain: remove www, port, lowercase
 */
function normalizeDomain(hostname: string): string {
  return hostname
    .toLowerCase()
    .split(':')[0] // Remove port
    .replace(/^www\./, '') // Remove www
}

export function proxy(request: NextRequest) {
  // =========================================================================
  // STEP 1: Read Host header (ONLY place in entire app that does this)
  // =========================================================================
  const rawHost = request.headers.get('host') || ''
  const normalizedHost = normalizeDomain(rawHost)
  
  // =========================================================================
  // STEP 2: Determine tenant domain
  // =========================================================================
  let tenantDomain: string
  
  if (normalizedHost === 'localhost') {
    // Localhost: use development fallback
    const devDomain = process.env.NEXT_PUBLIC_DEV_DOMAIN || 'kaburlutoday.com'
    tenantDomain = normalizeDomain(devDomain)
    console.log(`🔧 [PROXY] localhost detected → using NEXT_PUBLIC_DEV_DOMAIN: ${devDomain} → tenantDomain: ${tenantDomain}`)
  } else {
    // Production: ALWAYS use actual host header
    tenantDomain = normalizedHost
    console.log(`🌐 [PROXY] Production domain: ${tenantDomain}`)
  }
  
  // =========================================================================
  // STEP 3: Get tenant slug for URL rewriting
  // =========================================================================
  const tenantSlug = DOMAIN_TO_TENANT[tenantDomain]
  
  if (!tenantSlug) {
    console.warn(`⚠️ Unknown domain: ${tenantDomain}, using fallback tenant`)
    // Unknown domain - use kaburlutoday as fallback and continue processing
    const response = NextResponse.next()
    response.headers.set('X-Tenant-Domain', tenantDomain)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }
  
  const { pathname } = request.nextUrl
  
  // =========================================================================
  // STEP 4: Skip internal Next.js routes
  // =========================================================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/t/') || // Already rewritten
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    const response = NextResponse.next()
    response.headers.set('X-Tenant-Domain', tenantDomain)
    // Static files can be cached, but HTML should not
    if (!pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }
    return response
  }
  
  // =========================================================================
  // STEP 5: Rewrite clean URLs to internal tenant paths
  // =========================================================================
  let internalPath: string
  
  if (pathname === '/' || pathname === '') {
    internalPath = `/t/${tenantSlug}`
  } else if (pathname.startsWith('/article/')) {
    internalPath = `/t/${tenantSlug}${pathname}`
  } else if (pathname.startsWith('/category/')) {
    internalPath = `/t/${tenantSlug}${pathname}`
  } else {
    // Other routes (legal pages, etc)
    const response = NextResponse.next()
    response.headers.set('x-tenant-domain', tenantDomain)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }
  
  // =========================================================================
  // STEP 6: Rewrite URL + inject custom header
  // =========================================================================
  const url = request.nextUrl.clone()
  url.pathname = internalPath
  
  const response = NextResponse.rewrite(url)
  
  // ✅ CRITICAL: Set custom header for downstream consumption
  response.headers.set('X-Tenant-Domain', tenantDomain)
  
  // ✅ CACHE PREVENTION: Force browser to never cache HTML pages
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  // 🧪 PRODUCTION VERIFICATION (uncomment to test):
  // console.log('[TENANT]', tenantDomain, '→', internalPath)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all requests except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

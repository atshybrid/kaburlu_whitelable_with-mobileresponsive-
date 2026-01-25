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
const DOMAIN_TO_TENANT: Record<string, string> = {
  'kaburlutoday.com': 'kaburlu-today',
  'm4news.in': 'm4-news',
  'prashnaayudham.com': 'prashnaayudham',
  'daxintimes.com': 'daxin-times',
  'kurnoolnews.com': 'kurnool-news',
  'chrnews.com': 'chr-news',
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
  } else {
    // Production: ALWAYS use actual host header
    tenantDomain = normalizedHost
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

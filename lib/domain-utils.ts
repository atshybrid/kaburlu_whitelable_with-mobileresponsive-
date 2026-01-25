import { headers } from 'next/headers'

/**
 * PRODUCTION-GRADE DOMAIN DETECTION
 * ==================================
 * 
 * ✅ ONLY reads the custom header set by middleware
 * ✅ NEVER reads Host header directly
 * ✅ Works for production AND localhost
 * 
 * Middleware sets: X-Tenant-Domain
 * This function reads it
 * 
 * @returns {Promise<string>} Normalized tenant domain (e.g., "kaburlutoday.com")
 */
export async function getTenantDomain(): Promise<string> {
  try {
    const h = await headers()
    
    // ✅ CRITICAL: Read ONLY the custom header set by middleware
    const tenantDomain = h.get('X-Tenant-Domain')
    
    if (tenantDomain) {
      return tenantDomain
    }
    
    // Fallback for edge cases (should never happen in production)
    console.warn('⚠️ X-Tenant-Domain header not set by middleware')
    return 'kaburlutoday.com'
    
  } catch (error) {
    console.error('❌ Error reading tenant domain:', error)
    return 'kaburlutoday.com'
  }
}

/**
 * Normalize domain string (remove www, port, lowercase)
 * Used by middleware only
 */
export function normalizeDomain(host?: string | null): string {
  const raw = String(host || '')
    .trim()
    .toLowerCase()
    .split(':')[0] // Remove port
  
  // Remove www prefix
  if (raw.startsWith('www.')) {
    return raw.slice(4)
  }
  
  return raw || 'localhost'
}

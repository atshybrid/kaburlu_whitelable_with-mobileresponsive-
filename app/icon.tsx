import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { resolveTenant } from '@/lib/tenant'
import { normalizeTenantDomain } from '@/lib/remote'

export const runtime = 'edge'

export const size = {
  width: 64,
  height: 64,
}

export const contentType = 'image/png'

const API_BASE_URL = process.env.API_BASE_URL || 'https://app.kaburlumedia.com/api/v1'

// Simple wrong tenant check without importing fallback-data (to avoid Node.js APIs in Edge Runtime)
function isWrongTenantDataSimple(data: unknown): boolean {
  if (!data) return true
  const dataString = JSON.stringify(data).toLowerCase()
  return dataString.includes('crown human rights') || dataString.includes('crown')
}

// Fetch config API for favicon with full config
async function getTenantConfig(domain: string): Promise<{ faviconUrl: string | null; primaryColor: string | null; name: string | null; displayName: string | null }> {
  try {
    console.log(`[Icon] Fetching config for domain: ${domain}`)
    
    const response = await fetch(`${API_BASE_URL}/public/config`, {
      headers: {
        'accept': 'application/json',
        'X-Tenant-Domain': domain,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.log(`[Icon] Config API failed: ${response.status}`)
      return { faviconUrl: null, primaryColor: null, name: null, displayName: null }
    }

    const config = await response.json()
    
    // Check if it's wrong tenant data
    if (isWrongTenantDataSimple(config)) {
      console.log(`[Icon] Wrong tenant data detected, using fallback`)
      return { faviconUrl: null, primaryColor: null, name: null, displayName: null }
    }

    console.log(`[Icon] Config loaded: ${config?.branding?.siteName || config?.tenant?.displayName || 'unknown'}`)
    
    return {
      faviconUrl: config?.branding?.favicon || null,
      primaryColor: config?.theme?.colors?.primary || null,
      name: config?.tenant?.displayName || config?.tenant?.name || config?.branding?.siteName || null,
      displayName: config?.tenant?.nativeName || config?.tenant?.displayName || null,
    }
  } catch (error) {
    console.error(`[Icon] Error fetching config:`, error)
    return { faviconUrl: null, primaryColor: null, name: null, displayName: null }
  }
}

export default async function Icon() {
  // Get tenant-specific data
  let tenantName = 'K'
  let accentColor = '#dc2626' // Default red color
  
  try {
    const h = await headers()
    const host = h.get('host') || 'localhost'
    const domain = normalizeTenantDomain(host)
    
    console.log(`[Icon] Generating icon for domain: ${domain}`)
    
    // Get full tenant config
    const config = await getTenantConfig(domain)
    
    // If favicon URL exists, redirect to it (will be handled by Next.js metadata)
    // For now, generate letter-based icon
    
    // Set tenant name from API response
    if (config.name && !config.name.toLowerCase().includes('crown')) {
      // Use first letter of native name if available, otherwise display name
      const nameToUse = config.displayName || config.name
      tenantName = nameToUse.charAt(0).toUpperCase()
    } else {
      // Use first letter of domain as fallback
      tenantName = domain.charAt(0).toUpperCase()
    }
    
    // Set accent color from API response
    if (config.primaryColor) {
      accentColor = config.primaryColor
    }
    
    console.log(`[Icon] Generated: name="${tenantName}", color="${accentColor}", favicon="${config.faviconUrl || 'none'}"`)
    
  } catch (error) {
    console.error('[Icon] Error loading tenant for icon:', error)
    tenantName = 'K'
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: accentColor,
          fontSize: 40,
          fontWeight: 800,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}
      >
        {tenantName}
      </div>
    ),
    { ...size },
  )
}

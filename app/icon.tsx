import { ImageResponse } from 'next/og'
import { headers } from 'next/headers'
import { resolveTenant } from '@/lib/tenant'
import { getDomainSettings, normalizeTenantDomain } from '@/lib/remote'

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

// Fetch config API for favicon
async function getFaviconUrl(domain: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/config`, {
      headers: {
        'accept': 'application/json',
        'X-Tenant-Domain': domain,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const config = await response.json()
    
    // Check if it's wrong tenant data
    if (isWrongTenantDataSimple(config)) {
      return null
    }

    return config?.branding?.faviconUrl || null
  } catch {
    return null
  }
}

export default async function Icon() {
  // Get tenant-specific data
  let tenantName = 'K'
  let accentColor = '#F4C430' // Kaburlu gold color
  
  try {
    const h = await headers()
    const host = h.get('host') || 'localhost'
    const domain = normalizeTenantDomain(host)
    
    // Try to get favicon URL from config API first
    const faviconUrl = await getFaviconUrl(domain)
    
    // If we have a valid favicon URL, redirect to it
    if (faviconUrl && !faviconUrl.includes('crown')) {
      // Return redirect to actual favicon
      // Note: We can't directly redirect in icon.tsx, so we'll generate based on config
      const tenant = await resolveTenant()
      tenantName = (tenant.name || tenant.slug || 'K').charAt(0).toUpperCase()
      
      // Try to get accent color from config
      try {
        const response = await fetch(`${API_BASE_URL}/public/config`, {
          headers: {
            'accept': 'application/json',
            'X-Tenant-Domain': domain,
          },
          cache: 'no-store',
        })
        
        if (response.ok) {
          const config = await response.json()
          if (config?.branding?.primaryColor && !isWrongTenantDataSimple(config)) {
            accentColor = config.branding.primaryColor
          }
        }
      } catch {
        // Use default color
      }
    } else {
      // Fallback - use Telugu letter for Kaburlu
      tenantName = 'క' // Telugu letter Ka
    }
  } catch (error) {
    console.error('Error loading tenant for icon:', error)
    tenantName = 'క'
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

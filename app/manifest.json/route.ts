import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'

/**
 * Dynamic Web App Manifest for PWA
 * 
 * Generates manifest.json based on tenant configuration
 */
export async function GET() {
  const config = await getConfig()
  
  if (!config) {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 })
  }
  
  const manifest = {
    name: config.branding.siteName,
    short_name: config.branding.siteName,
    description: config.seo.meta.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: config.theme.colors.primary,
    orientation: 'portrait-primary',
    icons: [
      {
        src: config.branding.favicon,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: config.branding.favicon,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['news', 'lifestyle', 'entertainment'],
    lang: config.content.defaultLanguage,
    dir: config.content.languages.find(l => l.defaultForTenant)?.direction || 'ltr',
    scope: '/',
    gcm_sender_id: config.integrations.push.fcmSenderId || undefined,
  }
  
  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const dynamic = 'force-dynamic'

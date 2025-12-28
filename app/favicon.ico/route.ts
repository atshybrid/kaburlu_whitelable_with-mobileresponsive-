import { NextResponse } from 'next/server'
import { getEffectiveSettings } from '@/lib/settings'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  // Most browsers request /favicon.ico directly.
  // Prefer tenant-provided faviconUrl; otherwise fall back to our generated /icon route.
  try {
    const s = await getEffectiveSettings()
    const faviconUrl = s?.branding?.faviconUrl || s?.settings?.branding?.faviconUrl
    if (faviconUrl) {
      return NextResponse.redirect(faviconUrl, 302)
    }
  } catch {
    // ignore
  }

  const url = new URL('/icon', request.url)
  return NextResponse.redirect(url, 302)
}

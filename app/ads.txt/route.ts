import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'

/**
 * Dynamic ads.txt for Google AdSense verification
 *
 * Served at: /ads.txt
 * Required by Google AdSense to authorise this domain to show ads.
 * Format: <ad-system-domain>, <publisher-id>, DIRECT, <cert-auth-id>
 *
 * Google's official cert-auth-id is always: f08c47fec0942fa0
 */
export async function GET() {
  try {
    const config = await getConfig()

    // Accept both field names backend may send
    const publisherId =
      config?.integrations?.ads?.adsense ||
      ((config?.integrations?.ads as Record<string, unknown>)?.adsenseClientId as string) ||
      null

    if (!publisherId) {
      return new NextResponse('# ads.txt — AdSense not configured\n', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    // Standard IAB ads.txt entry for Google AdSense
    const content = [
      `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`,
      '', // trailing newline
    ].join('\n')

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // cache 24h
      },
    })
  } catch (err) {
    console.error('ads.txt generation error:', err)
    return new NextResponse('# ads.txt — error\n', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

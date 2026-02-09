/**
 * Contact API endpoint
 * Fetches contact information from backend
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchJSON, normalizeTenantDomain } from '@/lib/remote'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get('host') || ''
    const domain = normalizeTenantDomain(host)

    // Fetch contact data from backend
    const url = `/public/contact?domain=${encodeURIComponent(domain)}`
    const data = await fetchJSON(url)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch contact data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'

/**
 * POST /api/reader/google-signin
 * Body: { googleIdToken: string }
 *
 * Proxies to backend POST /public/reader/google-signin
 * Backend verifies the Google ID token and returns { success, jwt, user }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body?.googleIdToken) {
      return NextResponse.json({ error: 'Missing googleIdToken' }, { status: 400 })
    }

    const backendBase = process.env.API_BASE_URL || ''
    if (!backendBase) {
      return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 503 })
    }

    const tenantDomain = await getTenantDomain()
    const url = `${backendBase}/public/reader/google-signin`

    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Domain': tenantDomain,
      },
      // Forward name/picture so backend can upsert the reader profile
      body: JSON.stringify({
        googleIdToken: body.googleIdToken,
        displayName: body.displayName ?? undefined,
        photoUrl: body.photoUrl ?? undefined,
      }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      console.error('❌ Google sign-in upstream error:', upstream.status, data)
      return NextResponse.json(
        { error: data?.message || 'Sign-in failed' },
        { status: upstream.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ /api/reader/google-signin error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

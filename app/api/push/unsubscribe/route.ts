import { NextRequest, NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'
import { getTenantDomain } from '@/lib/domain-utils'

/**
 * Push Notification Unsubscribe API
 *
 * POST /api/push/unsubscribe
 * Body: { endpoint: string }
 */
export async function POST(request: NextRequest) {
  try {
    const config = await getConfig()

    if (!config?.integrations.push.enabled) {
      return NextResponse.json({ error: 'Push notifications not configured' }, { status: 400 })
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    const tenantDomain = await getTenantDomain()
    const unsubscribeUrl =
      process.env.PUSH_UNSUBSCRIBE_URL ||
      (process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/public/push/unsubscribe` : '')

    let removed = false
    if (unsubscribeUrl) {
      const upstreamResponse = await fetch(unsubscribeUrl, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Tenant-Domain': tenantDomain,
        },
        cache: 'no-store',
        body: JSON.stringify({ endpoint }),
      })

      if (!upstreamResponse.ok) {
        const errorText = await upstreamResponse.text().catch(() => '')
        throw new Error(`Upstream unsubscribe failed ${upstreamResponse.status}: ${errorText}`)
      }

      removed = true
    }

    console.log('✅ Push unsubscription received:', { endpoint, tenantDomain, removed })

    return NextResponse.json({
      success: true,
      removed,
      message: removed ? 'Unsubscribed successfully' : 'Unsubscribed (set PUSH_UNSUBSCRIBE_URL to persist)',
    })
  } catch (error) {
    console.error('❌ Push unsubscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

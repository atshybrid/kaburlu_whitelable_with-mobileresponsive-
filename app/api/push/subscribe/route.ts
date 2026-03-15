import { NextRequest, NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'
import { getTenantDomain } from '@/lib/domain-utils'

/**
 * Push Notification Subscription API
 * 
 * Handles web push notification subscription requests.
 * Stores subscription data for sending push notifications later.
 * 
 * POST /api/push/subscribe
 * Body: { subscription: PushSubscription, fcmSenderId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const config = await getConfig()
    
    const vapidKey = config?.integrations.push.webPushVapidPublicKey || config?.integrations.push.vapidPublicKey
    if (!config?.integrations.push.enabled || !vapidKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { subscription, fcmSenderId } = body
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Missing subscription' },
        { status: 400 }
      )
    }

    const tenantDomain = await getTenantDomain()
    const subscribeUrl =
      process.env.PUSH_SUBSCRIBE_URL ||
      (process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/public/push/subscribe` : '')

    let persisted = false
    if (subscribeUrl) {
      // Backend expects raw PushSubscription object directly (not wrapped)
      const upstreamResponse = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Tenant-Domain': tenantDomain,
        },
        cache: 'no-store',
        body: JSON.stringify(subscription),
      })

      if (!upstreamResponse.ok) {
        const errorText = await upstreamResponse.text().catch(() => '')
        throw new Error(`Upstream subscribe failed ${upstreamResponse.status}: ${errorText}`)
      }

      persisted = true
    }
    
    console.log('✅ Push subscription received:', {
      endpoint: subscription.endpoint,
      fcmSenderId,
      tenantDomain,
      persisted,
    })
    
    return NextResponse.json({
      success: true,
      persisted,
      message: persisted
        ? 'Subscription stored successfully'
        : 'Subscription accepted (set PUSH_SUBSCRIBE_URL to persist)',
    })
    
  } catch (error) {
    console.error('❌ Push subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'

/**
 * GET  /api/reader/reactions?articleId=xxx
 *   → GET  {backendBase}/reactions/article/:id     (requires JWT)
 *   Returns: { reaction: 'LIKE'|'DISLIKE'|'NONE', likeCount, dislikeCount }
 *
 * PUT  /api/reader/reactions
 *   Body: { articleId, reaction: 'LIKE'|'DISLIKE'|'NONE' }
 *   → PUT  {backendBase}/reactions                  (requires JWT)
 *   Returns: { likeCount, dislikeCount }
 */

function authHeader(request: NextRequest): string | null {
  const v = request.headers.get('Authorization')
  return v || null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ reaction: 'NONE', likeCount: 0, dislikeCount: 0 })
    }

    const jwt = authHeader(request)

    const backendBase = process.env.API_BASE_URL || ''
    if (!backendBase) {
      return NextResponse.json({ reaction: 'NONE', likeCount: 0, dislikeCount: 0 })
    }

    const tenantDomain = await getTenantDomain()
    // JWT is optional — counts are always returned; user's own reaction is included only when logged in
    const reqHeaders: Record<string, string> = { 'X-Tenant-Domain': tenantDomain }
    if (jwt) reqHeaders['Authorization'] = jwt

    const upstream = await fetch(
      `${backendBase}/reactions/article/${encodeURIComponent(articleId)}`,
      {
        headers: reqHeaders,
        cache: 'no-store',
      }
    )

    if (!upstream.ok) {
      return NextResponse.json({ reaction: 'NONE', likeCount: 0, dislikeCount: 0 })
    }

    const raw = await upstream.json()
    // Backend returns { success, data: { reaction, counts: { likes, dislikes } } }
    const d = raw?.data ?? raw
    return NextResponse.json({
      reaction: d?.reaction ?? 'NONE',
      likeCount: d?.counts?.likes ?? d?.likeCount ?? 0,
      dislikeCount: d?.counts?.dislikes ?? d?.dislikeCount ?? 0,
    })
  } catch {
    return NextResponse.json({ reaction: 'NONE', likeCount: 0, dislikeCount: 0 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const jwt = authHeader(request)
    if (!jwt) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (!body?.articleId || !body?.reaction) {
      return NextResponse.json({ error: 'Missing articleId or reaction' }, { status: 400 })
    }

    const backendBase = process.env.API_BASE_URL || ''
    if (!backendBase) {
      return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 503 })
    }

    const tenantDomain = await getTenantDomain()
    const upstream = await fetch(`${backendBase}/reactions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: jwt,
        'X-Tenant-Domain': tenantDomain,
      },
      body: JSON.stringify({ articleId: body.articleId, reaction: body.reaction }),
    })

    const raw = await upstream.json()

    if (!upstream.ok) {
      return NextResponse.json(
        { error: raw?.message || raw?.error || 'Reaction failed' },
        { status: upstream.status }
      )
    }

    // Backend returns { success, data: { reaction, counts: { likes, dislikes } } }
    const d = raw?.data ?? raw
    return NextResponse.json({
      reaction: d?.reaction ?? 'NONE',
      likeCount: d?.counts?.likes ?? d?.likeCount ?? 0,
      dislikeCount: d?.counts?.dislikes ?? d?.dislikeCount ?? 0,
    })
  } catch (error) {
    console.error('❌ /api/reader/reactions PUT error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

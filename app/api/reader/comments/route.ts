import { NextRequest, NextResponse } from 'next/server'
import { getTenantDomain } from '@/lib/domain-utils'

/**
 * GET  /api/reader/comments?articleId=xxx
 *   → GET  {backendBase}/comments?articleId=xxx    (no auth needed)
 *
 * POST /api/reader/comments
 *   Body: { articleId, content }
 *   → POST {backendBase}/comments                  (requires JWT)
 */

function authHeader(request: NextRequest): string | null {
  return request.headers.get('Authorization') || null
}

// Backend comment has user.profile.{fullName, profilePhotoUrl}
// Frontend expects user.{displayName, photoUrl}
function normalizeComment(c: Record<string, unknown>): Record<string, unknown> {
  const user = (c.user ?? {}) as Record<string, unknown>
  const profile = (user.profile ?? {}) as Record<string, unknown>
  return {
    ...c,
    user: {
      id: user.id,
      displayName: (user.displayName as string) ?? (profile.fullName as string) ?? 'Reader',
      photoUrl: (user.photoUrl as string) ?? (profile.profilePhotoUrl as string) ?? null,
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ comments: [] })
    }

    const backendBase = process.env.API_BASE_URL || ''
    if (!backendBase) {
      return NextResponse.json({ comments: [] })
    }

    const tenantDomain = await getTenantDomain()
    const upstream = await fetch(
      `${backendBase}/comments?articleId=${encodeURIComponent(articleId)}`,
      {
        headers: { 'X-Tenant-Domain': tenantDomain },
        cache: 'no-store',
      }
    )

    if (!upstream.ok) return NextResponse.json({ comments: [] })

    const raw = await upstream.json()
    // Backend returns { success: true, data: [...comments] }
    const comments = (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [])
      .map((c: Record<string, unknown>) => normalizeComment(c))
    return NextResponse.json({ comments })
  } catch {
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const jwt = authHeader(request)
    if (!jwt) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (!body?.articleId || !body?.content?.trim()) {
      return NextResponse.json({ error: 'Missing articleId or content' }, { status: 400 })
    }

    const backendBase = process.env.API_BASE_URL || ''
    if (!backendBase) {
      return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 503 })
    }

    const tenantDomain = await getTenantDomain()
    const upstream = await fetch(`${backendBase}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: jwt,
        'X-Tenant-Domain': tenantDomain,
      },
      body: JSON.stringify({ articleId: body.articleId, content: body.content.trim() }),
    })

    const raw = await upstream.json()

    if (!upstream.ok) {
      return NextResponse.json(
        { error: raw?.message || raw?.error || 'Comment failed' },
        { status: upstream.status }
      )
    }

    // Backend returns { success: true, data: commentObject }; normalize to { comment }
    const commentData = normalizeComment(raw?.data ?? raw)
    return NextResponse.json({ comment: commentData })
  } catch (error) {
    console.error('❌ /api/reader/comments POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

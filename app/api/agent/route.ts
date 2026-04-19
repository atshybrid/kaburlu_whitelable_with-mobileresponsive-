/**
 * 🤖 AI Agent API Endpoint
 *
 * GET  /api/agent          — Agent status + backend health
 * POST /api/agent          — Execute agent task
 *
 * Tasks (POST body: { task, ...params }):
 *   health   — check backend health for a domain
 *   enhance  — enhance a single article (returns enriched fields)
 *   status   — full agent diagnostics
 *
 * Security:
 *   Set AGENT_SECRET env var to require `x-agent-secret` header on POST.
 *   Leave unset for open access (dev / internal use only).
 *
 * Cron (Vercel):
 *   Add to vercel.json crons to call GET /api/agent every hour for health monitoring.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  agentEnhanceArticle,
  checkBackendHealth,
  getAgentStatus,
} from '@/lib/ai-agent'
import { normalizeTenantDomain } from '@/lib/remote'
import type { Article } from '@/lib/data-sources'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// Auth helper
// ─────────────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.AGENT_SECRET
  // No secret configured → open (development / internal only)
  if (!secret) return true
  return req.headers.get('x-agent-secret') === secret
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — status + health snapshot
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const host = req.headers.get('x-tenant-domain') || req.headers.get('host') || ''
  const domain = normalizeTenantDomain(host) || 'kaburlutoday.com'

  const [baseStatus, health] = await Promise.all([
    Promise.resolve(getAgentStatus()),
    checkBackendHealth(domain),
  ])

  return NextResponse.json(
    { ...baseStatus, domain, backend: health },
    {
      headers: {
        'Cache-Control': 'no-store',
        'X-Agent-Domain': domain,
      },
    },
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — execute task
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized — set x-agent-secret header' },
      { status: 401 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const task = String(body.task ?? '')

  // ── Task: health ──────────────────────────────────────────────────────────
  if (task === 'health') {
    const rawDomain =
      String(body.domain ?? '') ||
      normalizeTenantDomain(req.headers.get('x-tenant-domain') || req.headers.get('host') || '') ||
      'kaburlutoday.com'
    const domain = normalizeTenantDomain(rawDomain)
    const health = await checkBackendHealth(domain)
    return NextResponse.json({ task: 'health', domain, result: health })
  }

  // ── Task: enhance ─────────────────────────────────────────────────────────
  if (task === 'enhance') {
    const rawArticle = body.article as Article | undefined
    if (!rawArticle || typeof rawArticle !== 'object') {
      return NextResponse.json(
        { error: 'Missing "article" in request body' },
        { status: 400 },
      )
    }
    const lang = String(body.lang ?? 'te')

    try {
      const enhanced = await agentEnhanceArticle(rawArticle, { lang })
      return NextResponse.json({
        task: 'enhance',
        slug: enhanced.slug ?? enhanced.id,
        result: {
          excerpt: enhanced.excerpt,
          highlights: enhanced.highlights,
          readingTimeMin: enhanced.readingTimeMin,
          meta: enhanced.meta,
        },
      })
    } catch (err) {
      return NextResponse.json(
        { error: 'Enhancement failed', detail: err instanceof Error ? err.message : String(err) },
        { status: 500 },
      )
    }
  }

  // ── Task: status ──────────────────────────────────────────────────────────
  if (task === 'status') {
    return NextResponse.json({ task: 'status', result: getAgentStatus() })
  }

  return NextResponse.json(
    { error: `Unknown task "${task}". Valid tasks: health, enhance, status` },
    { status: 400 },
  )
}

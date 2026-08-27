'use client'

import { useEffect, useRef } from 'react'
import { normalizeTenantDomain } from '@/lib/remote'

const HEARTBEAT_MS = 15000
const SESSION_KEY = 'epaper_sid'

export type EpaperEngagementEvent = 'heartbeat' | 'page_view'

function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://api.kaburlumedia.com/api/v1'
  )
}

function getTenantDomain(): string {
  const hostname = window.location.hostname
  if (hostname === 'localhost') {
    return normalizeTenantDomain(process.env.NEXT_PUBLIC_DEV_DOMAIN || 'kaburlutoday.com')
  }
  return normalizeTenantDomain(hostname)
}

function getSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

/**
 * POST engagement to backend — domain resolved via X-Tenant-Domain header.
 */
export async function sendEpaperEngagement(params: {
  issueId: string
  pageNumber: number
  deltaTimeMs: number
  event: EpaperEngagementEvent
}): Promise<void> {
  await fetch(`${getApiBase()}/public/analytics/epaper-engagement`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Domain': getTenantDomain(),
    },
    body: JSON.stringify({
      sessionId: getSessionId(),
      issueId: params.issueId,
      pageNumber: params.pageNumber,
      deltaTimeMs: params.deltaTimeMs,
      event: params.event,
    }),
    keepalive: true,
  })
}

/**
 * Tracks ePaper page time (15s heartbeats when tab visible) and page_view on page change.
 * Mount in the ePaper reader component with current issueId + pageNumber.
 */
export function useEpaperEngagement(issueId: string, pageNumber: number) {
  const pageRef = useRef(pageNumber)
  pageRef.current = pageNumber

  useEffect(() => {
    if (!issueId || !pageNumber) return
    sendEpaperEngagement({
      issueId,
      pageNumber,
      deltaTimeMs: 0,
      event: 'page_view',
    }).catch(() => {})
  }, [issueId, pageNumber])

  useEffect(() => {
    if (!issueId) return

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      sendEpaperEngagement({
        issueId,
        pageNumber: pageRef.current,
        deltaTimeMs: HEARTBEAT_MS,
        event: 'heartbeat',
      }).catch(() => {})
    }

    const interval = setInterval(tick, HEARTBEAT_MS)
    return () => clearInterval(interval)
  }, [issueId])
}

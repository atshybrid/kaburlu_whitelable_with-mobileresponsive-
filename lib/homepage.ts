import { headers } from 'next/headers'
import { fetchJSON } from './remote'
import type { Article } from './data-sources'
import { cache as reactCache } from 'react'

export type PublicHomepageSection = {
  id: string
  type: string
  label?: string
  ui?: Record<string, unknown>
  query?: Record<string, unknown>
}

export type PublicHomepageResponse = {
  version: string
  tenant?: { id: string; slug: string; name: string }
  theme?: { key: string }
  uiTokens?: Record<string, unknown>
  sections: PublicHomepageSection[]
  data: Record<string, Article[]>
}

function domainFromHost(host: string | null) {
  const h = (host || 'localhost').split(':')[0]
  return h || 'localhost'
}

export async function getPublicHomepage(params: {
  domain?: string
  v?: string | number
  shape?: string
  themeKey: string
  lang: string
}): Promise<PublicHomepageResponse> {
  return _getPublicHomepage(params)
}

const _getPublicHomepage = reactCache(async (params: {
  domain?: string
  v?: string | number
  shape?: string
  themeKey: string
  lang: string
}): Promise<PublicHomepageResponse> => {
  const h = await headers()
  const domain = params.domain || domainFromHost(h.get('host'))
  const lang = String(params.lang || 'en')
  const themeKey = String(params.themeKey || 'style1')
  const shape = String(params.shape || themeKey)

  // Best-practice: keep tokens server-only (never NEXT_PUBLIC_*).
  // Prefer a dedicated bearer token env var name, but keep backward compat.
  const token = (process.env.REMOTE_PUBLIC_TOKEN || process.env.REMOTE_API_BEARER_TOKEN || '').trim()
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined

  const qs = new URLSearchParams({
    domain,
    v: String(params.v ?? '1'),
    shape,
    themeKey,
    lang,
  })

  return fetchJSON<PublicHomepageResponse>(`/public/homepage?${qs.toString()}`, {
    tenantDomain: domain,
    headers: authHeader,
    // Cache with revalidation; avoids repeated backend hits.
    revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
    tags: [`homepage:${domain}:${lang}:${themeKey}:${shape}`],
  })
})

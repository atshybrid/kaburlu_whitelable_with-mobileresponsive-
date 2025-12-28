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
  v?: string | number
  themeKey?: string
  lang?: string
}): Promise<PublicHomepageResponse> {
  return _getPublicHomepage(params)
}

const _getPublicHomepage = reactCache(async (params: {
  v?: string | number
  themeKey?: string
  lang?: string
}): Promise<PublicHomepageResponse> => {
  const h = await headers()
  const domain = domainFromHost(h.get('host'))
  const lang = String(params.lang || 'en')
  const themeKey = String(params.themeKey || 'style1')

  // Backend contract: GET /public/homepage?v=1 (optional lang/themeKey).
  // Domain is inferred via X-Tenant-Domain header.
  const qs = new URLSearchParams({ v: String(params.v ?? '1') })
  if (lang) qs.set('lang', lang)
  if (themeKey) qs.set('themeKey', themeKey)

  return fetchJSON<PublicHomepageResponse>(`/public/homepage?${qs.toString()}`, {
    tenantDomain: domain,
    // Cache with revalidation; avoids repeated backend hits.
    revalidateSeconds: Number(process.env.REMOTE_HOMEPAGE_REVALIDATE_SECONDS || '30'),
    tags: [`homepage:${domain}:${lang}:${themeKey}`],
  })
})

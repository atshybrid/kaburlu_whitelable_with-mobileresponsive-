import { fetchJSON } from '@/lib/remote'

export interface ReporterProfile {
  id: string
  name: string
  designation?: string
  bio?: string
  photoUrl?: string
  email?: string
  totalArticles?: number
  totalViews?: number
  location?: {
    state?: string
    district?: string
    mandal?: string
  }
  recentArticles?: Array<{
    id: string
    slug: string
    title: string
    coverImageUrl?: string
    publishedAt?: string
    viewCount?: number
    category?: { slug?: string; name?: string }
  }>
}

export async function fetchReporterProfile(
  tenantId: string,
  reporterId: string,
  tenantDomain: string,
): Promise<ReporterProfile | null> {
  try {
    const data = await fetchJSON<ReporterProfile | { data?: ReporterProfile }>(
      `/tenants/${encodeURIComponent(tenantId)}/reporters/${encodeURIComponent(reporterId)}`,
      { tenantDomain, cache: 'no-store' },
    )
    if (!data) return null
    if ('data' in data && data.data) return data.data
    return data as ReporterProfile
  } catch {
    return null
  }
}

export function buildReporterPersonJsonLd(
  reporter: ReporterProfile,
  siteUrl: string,
  siteName: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/reporters/${reporter.id}`,
    name: reporter.name,
    ...(reporter.photoUrl ? { image: reporter.photoUrl } : {}),
    ...(reporter.designation ? { jobTitle: reporter.designation } : {}),
    ...(reporter.bio ? { description: reporter.bio } : {}),
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: siteUrl,
    },
    url: `${siteUrl}/reporters/${reporter.id}`,
  }
}

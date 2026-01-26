import { fetchJSON } from './remote'
import { cache as reactCache } from 'react'

export type DomainStats = {
  domain: string
  tenantId: string
  tenantName: string
  stats: {
    totalArticles: number
    totalViews: number
    totalReporters: number
    articlesToday: number
    viewsToday: number
  }
  categoryBreakdown?: Array<{
    slug: string
    name: string
    articleCount: number
    totalViews: number
  }>
  topArticles?: Array<{
    id: string
    slug: string
    title: string
    viewCount: number
    publishedAt: string
    category?: {
      slug: string
      name: string
    }
    coverImageUrl?: string
    image?: string
  }>
}

export const getDomainStats = reactCache(async (domain: string): Promise<DomainStats | null> => {
  try {
    const stats = await fetchJSON<DomainStats>(
      `/public/domain/stats?domain=${encodeURIComponent(domain)}`,
      {
        method: 'GET',
        tenantDomain: domain,
        revalidateSeconds: 300, // Cache for 5 minutes
      }
    )
    return stats
  } catch (error) {
    console.error('Failed to fetch domain stats:', error)
    return null
  }
})

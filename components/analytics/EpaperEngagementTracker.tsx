'use client'

import { useEpaperEngagement } from '@/hooks/useEpaperEngagement'

/**
 * Invisible tracker for ePaper read time — mount inside the page viewer.
 *
 * ```tsx
 * <EpaperEngagementTracker issueId={issue.id} pageNumber={currentPage} />
 * ```
 */
export function EpaperEngagementTracker({
  issueId,
  pageNumber,
}: {
  issueId: string
  pageNumber: number
}) {
  useEpaperEngagement(issueId, pageNumber)
  return null
}

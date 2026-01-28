'use client'

import { CongratulationsOverlay } from './CongratulationsOverlay'

interface CongratulationsWrapperProps {
  viewCount: number
  tenantName: string
  locale?: string
  articleId?: string
}

export function CongratulationsWrapper({
  viewCount,
  tenantName,
  locale = 'te',
  articleId
}: CongratulationsWrapperProps) {
  return (
    <CongratulationsOverlay
      viewCount={viewCount}
      tenantName={tenantName}
      locale={locale}
      articleId={articleId}
    />
  )
}

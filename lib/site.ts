export function getSiteUrl() {
  if (typeof window !== 'undefined' && window.location) {
    return (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '')
  }
  return (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
}

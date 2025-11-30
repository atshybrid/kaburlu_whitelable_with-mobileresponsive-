export function getSiteUrl() {
  if (typeof window !== 'undefined' && window.location) {
    return (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '')
  }
  return (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
}

export function getSiteName() {
  return (process.env.NEXT_PUBLIC_SITE_NAME || 'News').trim()
}

export function isMobileAppViewEnabled() {
  return (process.env.NEXT_PUBLIC_ENABLE_MOBILE_APP_VIEW || 'true').toLowerCase() !== 'false'
}

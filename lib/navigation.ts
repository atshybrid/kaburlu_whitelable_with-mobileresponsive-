export type NavLink = {
  label: string
  href?: string
  external?: boolean
  badge?: string
  icon?: string
  highlight?: boolean
}

export type NavCTA = {
  label: string
  href: string
  variant?: 'solid' | 'outline'
}

export type TenantNavigationConfig = {
  brand: {
    logoText: string
    tagline?: string
    locale?: string
  }
  sticky: {
    enabled: boolean
    offsetPx?: number
  }
  utilityLinks: NavLink[]
  primaryLinks: NavLink[]
  quickLinks: NavLink[]
  socialLinks: NavLink[]
  cta?: NavCTA
  mobile: {
    featuredTag?: NavLink
    quickActions: NavLink[]
    primaryLinks: NavLink[]
    bottomNavLinks: NavLink[]
    socialLinks?: NavLink[]
  }
}

const defaultNavigationConfig: TenantNavigationConfig = {
  brand: {
    logoText: 'దిశ',
    tagline: '…towards truth',
    locale: 'te-IN'
  },
  sticky: {
    enabled: true,
    offsetPx: 0
  },
  utilityLinks: [
    { label: 'Telugu Edition', href: '#', icon: 'translate' },
    { label: 'Download App', href: '#', icon: 'download', highlight: true },
    { label: 'Choose City', href: '#', icon: 'location' }
  ],
  primaryLinks: [
    { label: 'Home', href: '/' },
    { label: 'తెలంగాణ', href: '/category/politics' },
    { label: 'ఆంధ్రప్రదేశ్', href: '/category/world' },
    { label: 'బిజినెస్', href: '/category/business' },
    { label: 'మార్కెట్స్', href: '/category/markets' },
    { label: 'టెక్నాలజీ', href: '/category/technology' },
    { label: 'స్పోర్ట్స్', href: '/category/sports' },
    { label: 'లైఫ్‌స్టైల్', href: '/category/lifestyle' },
    { label: 'సినిమా', href: '/category/entertainment' }
  ],
  quickLinks: [
    { label: 'Live TV', href: '/live', highlight: true },
    { label: 'Web Stories', href: '#webstories' },
    { label: 'Explainers', href: '#insights' },
    { label: 'Photo Gallery', href: '/photos' }
  ],
  socialLinks: [
    { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
    { label: 'WhatsApp', href: 'https://wa.me/9100000000', icon: 'whatsapp' },
    { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' }
  ],
  cta: {
    label: 'Subscribe',
    href: '/subscribe',
    variant: 'solid'
  },
  mobile: {
    featuredTag: { label: 'బ్రేకింగ్', href: '#breaking', badge: 'LIVE' },
    quickActions: [
      { label: 'Live TV', href: '/live', icon: 'play' },
      { label: 'Shorts', href: '/shorts', icon: 'flash' },
      { label: 'E-Paper', href: '/epaper', icon: 'epaper' }
    ],
    primaryLinks: [
      { label: 'Top Stories', href: '/#top' },
      { label: 'తెలంగాణ', href: '/category/politics' },
      { label: 'ఆంధ్రప్రదేశ్', href: '/category/world' },
      { label: 'బిజినెస్', href: '/category/business' },
      { label: 'టెక్నాలజీ', href: '/category/technology' }
    ],
    bottomNavLinks: [
      { label: 'Home', href: '/', icon: 'home' },
      { label: 'Districts', href: '/districts', icon: 'grid' },
      { label: 'Shorts', href: '/shorts', icon: 'flash' },
      { label: 'More', href: '#', icon: 'menu' }
    ],
    socialLinks: [
      { label: 'WhatsApp', href: 'https://wa.me/9100000000', icon: 'whatsapp' },
      { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' }
    ]
  }
}

export function getNavigationConfig(): TenantNavigationConfig {
  const raw = process.env.NEXT_PUBLIC_NAVIGATION_CONFIG
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as TenantNavigationConfig
      return mergeWithDefaults(parsed)
    } catch (err) {
      console.warn('Invalid NEXT_PUBLIC_NAVIGATION_CONFIG JSON', err)
    }
  }
  return defaultNavigationConfig
}

function mergeWithDefaults(partial: Partial<TenantNavigationConfig>): TenantNavigationConfig {
  return {
    brand: {
      ...defaultNavigationConfig.brand,
      ...(partial.brand || {})
    },
    sticky: {
      ...defaultNavigationConfig.sticky,
      ...(partial.sticky || {})
    },
    utilityLinks: partial.utilityLinks?.length ? partial.utilityLinks : defaultNavigationConfig.utilityLinks,
    primaryLinks: partial.primaryLinks?.length ? partial.primaryLinks : defaultNavigationConfig.primaryLinks,
    quickLinks: partial.quickLinks?.length ? partial.quickLinks : defaultNavigationConfig.quickLinks,
    socialLinks: partial.socialLinks?.length ? partial.socialLinks : defaultNavigationConfig.socialLinks,
    cta: partial.cta || defaultNavigationConfig.cta,
    mobile: {
      featuredTag: partial.mobile?.featuredTag || defaultNavigationConfig.mobile.featuredTag,
      quickActions: partial.mobile?.quickActions?.length ? partial.mobile.quickActions : defaultNavigationConfig.mobile.quickActions,
      primaryLinks: partial.mobile?.primaryLinks?.length ? partial.mobile.primaryLinks : defaultNavigationConfig.mobile.primaryLinks,
      bottomNavLinks: partial.mobile?.bottomNavLinks?.length ? partial.mobile.bottomNavLinks : defaultNavigationConfig.mobile.bottomNavLinks,
      socialLinks: partial.mobile?.socialLinks?.length ? partial.mobile.socialLinks : defaultNavigationConfig.mobile.socialLinks
    }
  }
}

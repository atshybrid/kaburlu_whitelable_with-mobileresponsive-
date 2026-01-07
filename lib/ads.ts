import type { EffectiveSettings } from '@/lib/remote'

export type AdProvider = 'none' | 'local' | 'google'
export type AdSlotType = 'banner' | 'sidebar' | 'inline' | 'widget'

export type AdSize = { width: number; height: number; label?: string }

export type AdSlotDefinition = {
  key: AdSlotKey
  name: string
  type: AdSlotType
  sizes: AdSize[]
}

export type AdSlotKey =
  | 'home_top_banner'
  | 'home_left_1'
  | 'home_left_2'
  | 'home_right_1'
  | 'home_right_2'
  | 'home_bottom_banner'
  | 'home_horizontal_1'
  | 'home_horizontal_2'
  | 'home_horizontal_3'
  | 'article_sidebar_top'
  | 'article_sidebar_bottom'
  | 'article_inline'
  | 'tv9_top_banner'
  | 'tv9_sidebar_widget'
  | 'style2_article_sidebar'

export const AD_SLOTS: Record<AdSlotKey, AdSlotDefinition> = {
  home_top_banner: {
    key: 'home_top_banner',
    name: 'Home: Top Banner',
    type: 'banner',
    sizes: [
      { width: 728, height: 90, label: 'Leaderboard (Desktop)' },
      { width: 970, height: 250, label: 'Billboard (Desktop, optional)' },
      { width: 320, height: 100, label: 'Large Mobile Banner' },
    ],
  },
  home_left_1: {
    key: 'home_left_1',
    name: 'Home: Left Rail Ad #1',
    type: 'sidebar',
    sizes: [
      { width: 300, height: 250, label: 'Medium Rectangle' },
      { width: 336, height: 280, label: 'Large Rectangle' },
    ],
  },
  home_left_2: {
    key: 'home_left_2',
    name: 'Home: Left Rail Ad #2',
    type: 'sidebar',
    sizes: [
      { width: 300, height: 250, label: 'Medium Rectangle' },
      { width: 300, height: 600, label: 'Half Page' },
    ],
  },
  home_right_1: {
    key: 'home_right_1',
    name: 'Home: Right Rail Ad #1',
    type: 'sidebar',
    sizes: [
      { width: 300, height: 250, label: 'Medium Rectangle' },
      { width: 336, height: 280, label: 'Large Rectangle' },
    ],
  },
  home_right_2: {
    key: 'home_right_2',
    name: 'Home: Right Rail Ad #2',
    type: 'sidebar',
    sizes: [
      { width: 300, height: 600, label: 'Half Page' },
      { width: 300, height: 250, label: 'Medium Rectangle' },
    ],
  },
  home_bottom_banner: {
    key: 'home_bottom_banner',
    name: 'Home: Bottom Banner',
    type: 'banner',
    sizes: [
      { width: 728, height: 90, label: 'Leaderboard' },
      { width: 320, height: 100, label: 'Large Mobile Banner' },
    ],
  },
  home_horizontal_1: {
    key: 'home_horizontal_1',
    name: 'Home: Horizontal Ad #1',
    type: 'banner',
    sizes: [
      { width: 970, height: 250, label: 'Billboard' },
      { width: 728, height: 90, label: 'Leaderboard' },
      { width: 320, height: 100, label: 'Large Mobile Banner' },
    ],
  },
  home_horizontal_2: {
    key: 'home_horizontal_2',
    name: 'Home: Horizontal Ad #2',
    type: 'banner',
    sizes: [
      { width: 970, height: 250, label: 'Billboard' },
      { width: 728, height: 90, label: 'Leaderboard' },
      { width: 320, height: 100, label: 'Large Mobile Banner' },
    ],
  },
  home_horizontal_3: {
    key: 'home_horizontal_3',
    name: 'Home: Horizontal Ad #3',
    type: 'banner',
    sizes: [
      { width: 970, height: 250, label: 'Billboard' },
      { width: 728, height: 90, label: 'Leaderboard' },
      { width: 320, height: 100, label: 'Large Mobile Banner' },
    ],
  },
  article_sidebar_top: {
    key: 'article_sidebar_top',
    name: 'Article: Sidebar Top',
    type: 'sidebar',
    sizes: [{ width: 300, height: 250, label: 'Medium Rectangle' }],
  },
  article_sidebar_bottom: {
    key: 'article_sidebar_bottom',
    name: 'Article: Sidebar Bottom',
    type: 'sidebar',
    sizes: [{ width: 300, height: 600, label: 'Half Page' }],
  },
  article_inline: {
    key: 'article_inline',
    name: 'Article: Inline (between paragraphs)',
    type: 'inline',
    sizes: [
      { width: 728, height: 90, label: 'Leaderboard' },
      { width: 320, height: 100, label: 'Large Mobile Banner' },
    ],
  },
  tv9_top_banner: {
    key: 'tv9_top_banner',
    name: 'TV9 Theme: Top Banner',
    type: 'banner',
    sizes: [
      { width: 728, height: 90, label: 'Leaderboard' },
      { width: 320, height: 100, label: 'Large Mobile Banner' },
    ],
  },
  tv9_sidebar_widget: {
    key: 'tv9_sidebar_widget',
    name: 'TV9 Theme: Sidebar Widget',
    type: 'widget',
    sizes: [
      { width: 300, height: 250, label: 'Medium Rectangle' },
      { width: 300, height: 600, label: 'Half Page' },
    ],
  },
  style2_article_sidebar: {
    key: 'style2_article_sidebar',
    name: 'Style2 Article: Sidebar',
    type: 'sidebar',
    sizes: [{ width: 300, height: 250, label: 'Medium Rectangle' }],
  },
}

export type LocalAdConfig = {
  enabled?: boolean
  imageUrl?: string
  clickUrl?: string
  alt?: string
  /** Optional small brand/logo image displayed in debug mode */
  logoUrl?: string
}

export type GoogleAdConfig = {
  enabled?: boolean
  client?: string
  slot?: string
  format?: string
  responsive?: boolean
}

export type SlotAdConfig = {
  enabled?: boolean
  provider?: AdProvider
  label?: string
  local?: LocalAdConfig
  google?: GoogleAdConfig
}

export type AdsSettings = {
  enabled?: boolean
  debug?: boolean
  googleAdsense?: { client?: string }
  slots?: Partial<Record<AdSlotKey, SlotAdConfig>>
}

function pickAdsFromSettings(settings?: EffectiveSettings): AdsSettings | undefined {
  const a = (settings as unknown as { ads?: AdsSettings })?.ads
  const legacy = (settings as unknown as { settings?: { ads?: AdsSettings } })?.settings?.ads
  return a || legacy
}

export function getAdsSettings(settings?: EffectiveSettings): AdsSettings {
  const fromRemote = pickAdsFromSettings(settings) || {}

  const enabledEnv = process.env.NEXT_PUBLIC_ADS_ENABLED
  const debugEnv = process.env.NEXT_PUBLIC_ADS_DEBUG

  const enabled = typeof fromRemote.enabled === 'boolean' ? fromRemote.enabled : enabledEnv === '1' || enabledEnv === 'true'
  const debug = typeof fromRemote.debug === 'boolean' ? fromRemote.debug : debugEnv === '1' || debugEnv === 'true'

  const clientFromEnv = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const client = fromRemote.googleAdsense?.client || clientFromEnv

  return {
    enabled,
    debug,
    googleAdsense: { client },
    slots: fromRemote.slots || {},
  }
}

export function getSlotConfig(settings: AdsSettings, slot: AdSlotKey): SlotAdConfig {
  const cfg = settings.slots?.[slot] || {}
  return cfg
}

export function resolveProvider(settings: AdsSettings, slot: AdSlotKey): AdProvider {
  if (!settings.enabled) return 'none'
  const cfg = getSlotConfig(settings, slot)
  if (cfg.enabled === false) return 'none'
  const provider = cfg.provider || 'none'
  if (provider === 'local') {
    if (cfg.local?.enabled === false) return 'none'
    if (!cfg.local?.imageUrl) return 'none'
    return 'local'
  }
  if (provider === 'google') {
    const client = cfg.google?.client || settings.googleAdsense?.client
    if (cfg.google?.enabled === false) return 'none'
    if (!client || !cfg.google?.slot) return 'none'
    return 'google'
  }
  return 'none'
}

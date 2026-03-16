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
  | 'article_square'
  | 'article_horizontal'
  | 'article_vertical'
  | 'article_multiplex_h'   // Multiplex horizontal (grid of ads) — best at article end
  | 'article_multiplex_v'   // Multiplex vertical (list of ads) — best in sidebar
  | 'home_multiplex'        // Multiplex on homepage — between sections
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
  // ── 3 standard display ad types (Square / Horizontal / Vertical) ──────────
  article_square: {
    key: 'article_square',
    name: 'Display: Square (300×250)',
    type: 'inline',
    sizes: [{ width: 300, height: 250, label: 'Medium Rectangle / Square' }],
  },
  article_horizontal: {
    key: 'article_horizontal',
    name: 'Display: Horizontal (728×90)',
    type: 'banner',
    sizes: [
      { width: 728, height: 90, label: 'Leaderboard' },
      { width: 320, height: 50, label: 'Mobile Banner' },
    ],
  },
  article_vertical: {
    key: 'article_vertical',
    name: 'Display: Vertical (300×600)',
    type: 'sidebar',
    sizes: [{ width: 300, height: 600, label: 'Half Page / Vertical' }],
  },
  // ── Multiplex (Google autorelaxed — grid or list of sponsored content) ─────
  article_multiplex_h: {
    key: 'article_multiplex_h',
    name: 'Multiplex: Horizontal grid (article end)',
    type: 'banner',
    sizes: [{ width: 728, height: 280, label: 'Multiplex Horizontal' }],
  },
  article_multiplex_v: {
    key: 'article_multiplex_v',
    name: 'Multiplex: Vertical list (sidebar)',
    type: 'sidebar',
    sizes: [{ width: 300, height: 600, label: 'Multiplex Vertical' }],
  },
  home_multiplex: {
    key: 'home_multiplex',
    name: 'Multiplex: Homepage between sections',
    type: 'banner',
    sizes: [{ width: 728, height: 280, label: 'Multiplex' }],
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
  layout?: string   // e.g. 'in-article' for native; omit for display/multiplex
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

type BackendSimpleSlot = {
  slotId?: string
  format?: string
  enabled?: boolean
}

const BACKEND_SLOT_ALIASES: Record<string, AdSlotKey[]> = {
  // Generic display keys from backend (v2 simplified payload)
  display_square: ['article_square'],
  display_horizontal: ['home_top_banner', 'home_bottom_banner', 'home_horizontal_1', 'home_horizontal_2', 'home_horizontal_3', 'article_horizontal'],
  display_vertical: ['home_right_1', 'home_right_2', 'style2_article_sidebar', 'article_vertical', 'article_sidebar_top', 'article_sidebar_bottom'],
  in_article: ['article_inline'],
  multiplex_horizontal: ['home_multiplex', 'article_multiplex_h'],
  multiplex_vertical: ['article_multiplex_v'],

  // Home-top should feed both banner and leaderboard placements used by themes.
  home_top: ['home_top_banner', 'home_horizontal_1'],
  home_mid: ['home_horizontal_2', 'home_horizontal_3'],
  // Single backend key to drive homepage sidebar in both style1 and style2 contexts.
  home_sidebar: ['home_right_1', 'home_right_2', 'style2_article_sidebar', 'article_vertical', 'article_sidebar_top'],
  article_top: ['article_horizontal'],
  article_mid: ['article_inline'],
  article_multiplex: ['article_multiplex_h', 'article_multiplex_v'],
  category_top: ['home_horizontal_1'],
  category_mid: ['home_horizontal_2', 'home_horizontal_3'],
}

function isAdSlotKey(value: string): value is AdSlotKey {
  return value in AD_SLOTS
}

function normalizeSlotConfig(input: unknown, fallbackClient?: string): SlotAdConfig | undefined {
  if (!input || typeof input !== 'object') return undefined

  const raw = input as Record<string, unknown>
  const hasStructuredConfig =
    Object.prototype.hasOwnProperty.call(raw, 'provider') ||
    Object.prototype.hasOwnProperty.call(raw, 'google') ||
    Object.prototype.hasOwnProperty.call(raw, 'local')

  if (hasStructuredConfig) {
    const cfg = raw as SlotAdConfig
    if (cfg.provider === 'google' || cfg.google?.slot) {
      return {
        ...cfg,
        google: {
          ...cfg.google,
          client: cfg.google?.client || fallbackClient,
        },
      }
    }
    return cfg
  }

  const simple = raw as BackendSimpleSlot
  const slotId = typeof simple.slotId === 'string' ? simple.slotId.trim() : ''
  if (!slotId) {
    if (typeof simple.enabled === 'boolean') {
      return {
        enabled: simple.enabled,
        provider: simple.enabled ? 'google' : 'none',
      }
    }
    return undefined
  }

  return {
    enabled: typeof simple.enabled === 'boolean' ? simple.enabled : true,
    provider: 'google',
    google: {
      client: fallbackClient,
      slot: slotId,
      format: typeof simple.format === 'string' ? simple.format : 'auto',
      responsive: true,
    },
  }
}

function normalizeRemoteAds(rawAds?: AdsSettings): AdsSettings | undefined {
  if (!rawAds || typeof rawAds !== 'object') return undefined

  const src = rawAds as AdsSettings & { adsenseClientId?: string; slots?: Record<string, unknown> }
  const client =
    (typeof src.googleAdsense?.client === 'string' && src.googleAdsense.client.trim())
      ? src.googleAdsense.client.trim()
      : (typeof src.adsenseClientId === 'string' ? src.adsenseClientId.trim() : undefined)

  const normalizedSlots: Partial<Record<AdSlotKey, SlotAdConfig>> = {}
  const incomingSlots = src.slots && typeof src.slots === 'object' ? src.slots : {}

  for (const [rawKey, rawValue] of Object.entries(incomingSlots)) {
    const config = normalizeSlotConfig(rawValue, client)
    if (!config) continue

    const mappedKeys = BACKEND_SLOT_ALIASES[rawKey] || (isAdSlotKey(rawKey) ? [rawKey] : [])
    for (const key of mappedKeys) {
      normalizedSlots[key] = config
    }
  }

  return {
    enabled: src.enabled,
    debug: src.debug,
    googleAdsense: { client },
    slots: normalizedSlots,
  }
}

// ─── Default AdSense unit IDs from Google AdSense → Ads → By ad unit ─────────
// Map each slot key to the real AdSense unit ID + format.
// These act as automatic defaults — backend can override per-slot via config API.
// Slot IDs: 1733944604 (In-article) | 5842616558 (In-feed) | 5998164269 (In-feed pa)
//           9355673582 (Vertical) | 7547767892 (Horizontal) | 3875453481 (PH_H1 display)
// TODO: Replace 3875453481 multiplex placeholders once real multiplex units are created in AdSense
const DEFAULT_ADSENSE_SLOTS: Partial<Record<AdSlotKey, { slot: string; format: string; layout?: string }>> = {
  // ── In-article native (paragraphs మధ్యలో) — layout is required for this format ──
  article_inline:          { slot: '1733944604', format: 'fluid', layout: 'in-article' },
  // ── In-feed (homepage article card lists) ────────────────────────────────────────
  home_horizontal_1:       { slot: '5842616558', format: 'fluid' },
  home_horizontal_2:       { slot: '5842616558', format: 'fluid' },
  home_horizontal_3:       { slot: '5998164269', format: 'fluid' },
  // ── Multiplex (autorelaxed = Google picks grid/list) — best at article end & homepage ──
  // NOTE: Using format="auto" until real Multiplex ad units are created in AdSense dashboard.
  // "autorelaxed" requires a dedicated Multiplex unit ID; using it with Display units
  // causes Google to reserve height (~250px) but never fill it → blank space.
  // Once you create Multiplex units in AdSense, set format: 'autorelaxed' and update slot IDs.
  article_multiplex_h:     { slot: '7547767892', format: 'auto' },   // placeholder: use real multiplex ID
  article_multiplex_v:     { slot: '9355673582', format: 'auto' },   // placeholder: use real multiplex ID
  home_multiplex:          { slot: '5842616558', format: 'fluid' },  // in-feed unit works here
  // ── Square 300×250 ─────────────────────────────────────────────────────────────────────
  article_square:          { slot: '9355673582', format: 'auto' },
  // ── Horizontal 728×90 ──────────────────────────────────────────────────────────────────
  article_horizontal:      { slot: '7547767892', format: 'auto' },
  // ── Vertical 300×600 ───────────────────────────────────────────────────────────────────
  article_vertical:        { slot: '9355673582', format: 'auto' },
  // ── Sidebar / right-rail ─────────────────────────────────────────────────────────────
  article_sidebar_top:     { slot: '9355673582', format: 'auto' },
  article_sidebar_bottom:  { slot: '9355673582', format: 'auto' },
  home_right_1:            { slot: '9355673582', format: 'auto' },
  home_right_2:            { slot: '9355673582', format: 'auto' },
  tv9_sidebar_widget:      { slot: '9355673582', format: 'auto' },
  style2_article_sidebar:  { slot: '9355673582', format: 'auto' },
  // ── Banner / leaderboard ────────────────────────────────────────────────────────────
  home_top_banner:         { slot: '7547767892', format: 'auto' },
  home_bottom_banner:      { slot: '7547767892', format: 'auto' },
  home_left_1:             { slot: '7547767892', format: 'auto' },
  home_left_2:             { slot: '7547767892', format: 'auto' },
  tv9_top_banner:          { slot: '7547767892', format: 'auto' },
}

function pickAdsFromSettings(settings?: EffectiveSettings): AdsSettings | undefined {
  const a = (settings as unknown as { ads?: AdsSettings })?.ads
  const legacy = (settings as unknown as { settings?: { ads?: AdsSettings } })?.settings?.ads
  return normalizeRemoteAds(a || legacy)
}

export function getAdsSettings(settings?: EffectiveSettings): AdsSettings {
  const fromRemote = pickAdsFromSettings(settings) || {}

  const enabledEnv = process.env.NEXT_PUBLIC_ADS_ENABLED
  const debugEnv = process.env.NEXT_PUBLIC_ADS_DEBUG
  const frontendOwnedEnv = process.env.NEXT_PUBLIC_ADS_FRONTEND_OWNED
  const frontendOwned = frontendOwnedEnv ? (frontendOwnedEnv === '1' || frontendOwnedEnv === 'true') : true

  // Auto-switch to backend-driven slots when config API provides tenant slot mappings.
  const remoteSlots = fromRemote.slots || {}
  const hasRemoteSlots = Object.keys(remoteSlots).length > 0
  const preferRemote = hasRemoteSlots
  const useFrontendOwned = frontendOwned && !preferRemote

  const enabledFromEnv = enabledEnv === '1' || enabledEnv === 'true'
  const enabled = useFrontendOwned
    ? (enabledEnv ? enabledFromEnv : true)
    : (typeof fromRemote.enabled === 'boolean' ? fromRemote.enabled : enabledFromEnv)

  const debugFromEnv = debugEnv === '1' || debugEnv === 'true'
  const debug = useFrontendOwned
    ? (debugEnv ? debugFromEnv : !!fromRemote.debug)
    : (typeof fromRemote.debug === 'boolean' ? fromRemote.debug : debugFromEnv)

  const clientFromEnv = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const client = clientFromEnv || fromRemote.googleAdsense?.client

  // Optional dedicated Multiplex unit ID (from AdSense "Multiplex ad unit")
  // When set, multiplex slots use format="autorelaxed" for better fill quality.
  const multiplexSlotFromEnv = process.env.NEXT_PUBLIC_ADSENSE_MULTIPLEX_SLOT?.trim()

  // Build default slot configs from frontend defaults.
  // In frontend-owned mode, these are authoritative and do not depend on backend slot flow.
  const defaultSlots: Partial<Record<AdSlotKey, SlotAdConfig>> = {}
  if (client) {
    for (const [key, def] of Object.entries(DEFAULT_ADSENSE_SLOTS)) {
      const isMultiplexKey =
        key === 'article_multiplex_h' ||
        key === 'article_multiplex_v' ||
        key === 'home_multiplex'

      const resolvedGoogle = isMultiplexKey && multiplexSlotFromEnv
        ? { client, slot: multiplexSlotFromEnv, format: 'autorelaxed', responsive: true }
        : { client, slot: def.slot, format: def.format, layout: def.layout, responsive: true }

      defaultSlots[key as AdSlotKey] = {
        provider: 'google',
        google: resolvedGoogle,
      }
    }
  }

  // Deep-merge per slot so that default `layout` (e.g. 'in-article' for fluid ads) is
  // preserved when backend overrides the slot but doesn't send a layout field.
  const mergedSlots = useFrontendOwned ? defaultSlots : (() => {
    const result: Partial<Record<AdSlotKey, SlotAdConfig>> = {}
    const allKeys = new Set([...Object.keys(defaultSlots), ...Object.keys(remoteSlots)]) as Set<AdSlotKey>
    for (const key of allKeys) {
      const def = defaultSlots[key]
      const rem = remoteSlots[key]
      if (!rem) { result[key] = def; continue }
      if (!def) { result[key] = rem; continue }
      // Merge google sub-config: remote values win, but default layout is kept if remote omits it
      result[key] = { ...def, ...rem, google: { ...def.google, ...rem.google } }
    }
    return result
  })()

  return {
    enabled,
    debug,
    googleAdsense: { client },
    slots: mergedSlots,
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
    if (!client) return 'none'
    return 'google'
  }
  return 'none'
}

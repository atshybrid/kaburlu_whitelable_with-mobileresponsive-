import type { CSSProperties } from 'react'
import type { EffectiveSettings } from '@/lib/remote'

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function hexToRgb01(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace(/^#/, '')
  const normalized = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  if (normalized.length !== 6) return null
  const n = Number.parseInt(normalized, 16)
  if (!Number.isFinite(n)) return null
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return { r: r / 255, g: g / 255, b: b / 255 }
}

// Returns "H S% L%" suitable for: hsl(var(--accent))
export function hexToHslTriplet(hex: string): string | null {
  const rgb = hexToRgb01(hex)
  if (!rgb) return null

  const r = rgb.r
  const g = rgb.g
  const b = rgb.b

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  const hh = Math.round(h)
  const ss = Math.round(clamp01(s) * 100)
  const ll = Math.round(clamp01(l) * 100)

  return `${hh} ${ss}% ${ll}%`
}

function pickThemeColors(settings?: EffectiveSettings) {
  const t = settings?.theme
  const legacy = settings?.settings?.theme
  return t?.colors || legacy?.colors || undefined
}

export function themeCssVarsFromSettings(settings?: EffectiveSettings): CSSProperties {
  const colors = pickThemeColors(settings)
  if (!colors) return {}

  const accent = colors.accent ? hexToHslTriplet(String(colors.accent)) : null
  const primary = colors.primary ? hexToHslTriplet(String(colors.primary)) : null
  const secondary = colors.secondary ? hexToHslTriplet(String(colors.secondary)) : null

  const vars: Record<string, string> = {}
  if (accent) vars['--accent'] = accent
  if (primary) vars['--primary'] = primary
  if (secondary) vars['--secondary'] = secondary

  return vars as unknown as CSSProperties
}

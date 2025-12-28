export const DEFAULT_TENANTS = [
  { slug: 'demo', name: 'Kaburlu Demo', themeKey: 'style1' },
  { slug: 'andhra', name: 'Andhra News', themeKey: 'style2' },
  { slug: 'telangana', name: 'Telangana News', themeKey: 'style3' },
]

export type ThemeKey = 'style1' | 'style2' | 'style3'

export const THEMES: Record<ThemeKey, { name: string } > = {
  style1: { name: 'TV Magazine' },
  style2: { name: 'Modern Grid' },
  style3: { name: 'Classic Newspaper' },
}

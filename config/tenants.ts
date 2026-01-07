export const DEFAULT_TENANTS = [
  { slug: 'demo', name: 'Kaburlu Demo', themeKey: 'style1' },
  { slug: 'andhra', name: 'Andhra News', themeKey: 'style2' },
  { slug: 'telangana', name: 'Telangana News', themeKey: 'style3' },
  { slug: 'toi', name: 'Times Style News', themeKey: 'toi' },
]

export type ThemeKey = 'style1' | 'style2' | 'style3' | 'toi'

export const THEMES: Record<ThemeKey, { name: string } > = {
  style1: { name: 'TV Magazine' },
  style2: { name: 'Modern Grid' },
  style3: { name: 'Classic Newspaper' },
  toi: { name: 'Times of India Style' },
}

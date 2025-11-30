export const heroConfig = {
  leftListCount: 4,
  centerCount: 8,
  quickReadsCount: 4,
  bottomHeights: {
    md: 360,
    lg: 380,
  },
  centerCols: {
    md: 3,
    lg: 3,
  },
} as const

export type HeroConfig = typeof heroConfig

// Below-hero, 3-column news rows (repeatable)
export interface BelowHeroConfig {
  rows: number
  listCount: number
  categories: readonly string[]
}

export const belowHeroConfig: BelowHeroConfig = {
  rows: 1,               // how many repeated rows to render
  listCount: 4,          // bullets per column
  categories: [          // order to render; cycles if rows*3 exceeds length
    'business', 'politics', 'technology',
    'sports', 'markets', 'world',
  ],
}

export function getBelowHeroConfig(): BelowHeroConfig {
  const rows = Number(process.env.NEXT_PUBLIC_SECTION2_ROWS || belowHeroConfig.rows)
  const listCount = Number(process.env.NEXT_PUBLIC_SECTION2_COUNT || belowHeroConfig.listCount)
  const catsEnv = (process.env.NEXT_PUBLIC_SECTION2_CATEGORIES || '').trim()
  const categories = catsEnv ? (catsEnv.split(',').map(s=> s.trim()).filter(Boolean) as any) : belowHeroConfig.categories
  return {
    rows: Number.isFinite(rows) && rows > 0 ? rows : belowHeroConfig.rows,
    listCount: Number.isFinite(listCount) && listCount > 0 ? listCount : belowHeroConfig.listCount,
    categories,
  }
}

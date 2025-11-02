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
export const belowHeroConfig = {
  rows: 1,               // how many repeated rows to render
  listCount: 5,          // bullets per column
  categories: [          // order to render; cycles if rows*3 exceeds length
    'business', 'politics', 'technology',
    'sports', 'markets', 'world',
  ] as const,
} as const

export type BelowHeroConfig = typeof belowHeroConfig

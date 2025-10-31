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

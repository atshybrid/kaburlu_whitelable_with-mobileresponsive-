// Shared UI helpers and constants
export const HERO_BOTTOM_HEIGHT = `md:h-[360px] lg:h-[380px]`

export function centerGridCols(md: number, lg: number) {
  const clamp = (n: number) => Math.max(1, Math.min(6, Math.round(n)))
  const mdCols = clamp(md)
  const lgCols = clamp(lg)
  // Tailwind needs concrete classes; map allowed values.
  const toCols = (n: number) => {
    switch (n) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-2'
      case 3: return 'grid-cols-3'
      case 4: return 'grid-cols-4'
      case 5: return 'grid-cols-5'
      case 6: return 'grid-cols-6'
      default: return 'grid-cols-3'
    }
  }
  const mdClass = toCols(mdCols)
  const lgClass = toCols(lgCols)
  // If md and lg equal, just one class is enough
  return mdCols === lgCols ? mdClass : `${mdClass} lg:${lgClass}`
}

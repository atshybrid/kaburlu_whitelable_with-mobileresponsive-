declare module './HeroDailyClient' {
  import type { NormalizedShortArticle } from '../lib/api'
  const HeroDailyClient: (props: {
    catName: string
    leftTop: NormalizedShortArticle[]
    leftBottom: NormalizedShortArticle[]
    center: NormalizedShortArticle[]
    right: NormalizedShortArticle[]
  }) => JSX.Element
  export default HeroDailyClient
}

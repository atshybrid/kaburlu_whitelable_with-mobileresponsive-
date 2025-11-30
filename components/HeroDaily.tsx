import { fetchShortNews, normalizeShortNews, groupByCategory } from '../lib/api'
import HeroDailyClient from './HeroDailyClient'

export default async function HeroDaily() {
  let items = []
  let grouped: Record<string, ReturnType<typeof normalizeShortNews>[number][]> = {}
  try {
    const res = await fetchShortNews({ limit: 60 })
    items = normalizeShortNews(res.data)
    grouped = groupByCategory(items)
  } catch (e) {
    console.error('[HeroDaily] short news fetch failed, rendering skeleton', e)
  }
  const forced = process.env.NEXT_PUBLIC_SECTION2_FORCE_CATEGORY_NAME?.trim()
  const catName = (forced && grouped[forced]?.length)
    ? forced
    : Object.keys(grouped).sort((a, b) => (grouped[b]?.length || 0) - (grouped[a]?.length || 0))[0]
  const src = grouped[catName] || []

  const leftTop = src.slice(0, 1)
  const leftBottom = src.slice(1, 3)
  const center = src.slice(0, 12)
  const right = src.slice(0, 10)

  return (
    <HeroDailyClient
      catName={catName || 'News'}
      leftTop={leftTop}
      leftBottom={leftBottom}
      center={center}
      right={right}
    />
  )
}

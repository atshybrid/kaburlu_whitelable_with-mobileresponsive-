import AdBanner from '../components/AdBanner'
import TopCategoryBar from '../components/TopCategoryBar'
import HeroDaily from '../components/HeroDaily'
import CategorySection from '../components/CategorySection'
import Sidebar from '../components/Sidebar'
import MobileCardStack from '../components/MobileCardStack'
import { getArticlesByCategory } from '../lib/data'

export default function Home() {
  const business = getArticlesByCategory('business', 4)
  const markets = getArticlesByCategory('markets', 4)
  const technology = getArticlesByCategory('technology', 4)
  const sports = getArticlesByCategory('sports', 4)

  return (
    <main className="py-4">
      {/* Mobile 9:16 swipe-style stack */}
      <div className="md:hidden">
        <MobileCardStack />
      </div>

      {/* Desktop/Tablet classic layout */}
      <div className="hidden md:block">
        {/* Yellow categories bar like reference */}
        <TopCategoryBar />
        {/* Horizontal ad banner below header */}
        <section aria-label="Horizontal Ads" className="mt-3">
          <AdBanner height={120} />
        </section>
        {/* Disha-style 3-column layout */}
        <HeroDaily />
        {/* Separator divider after hero */}
        <section aria-hidden="true" className="my-6">
          <hr className="border-t border-gray-200 dark:border-gray-800" />
        </section>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            <CategorySection title="Latest in Business" slug="business" items={business} />
            <CategorySection title="Markets" slug="markets" items={markets} />
            <CategorySection title="Technology" slug="technology" items={technology} />
            <CategorySection title="Sports" slug="sports" items={sports} />
          </div>
          <Sidebar />
        </div>
      </div>
    </main>
  )
}

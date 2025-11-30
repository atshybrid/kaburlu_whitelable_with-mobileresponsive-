import Link from 'next/link'
import AdBanner from '../components/AdBanner'
import HeroDaily from '../components/HeroDaily'
import ThreeColNews from '../components/ThreeColNews'
import MobileCardStack from '../components/MobileCardStack'
import { getAllArticles, getArticlesByCategory, getTopHeadlines } from '../lib/data'
import { isMobileAppViewEnabled } from '../lib/site'

export const dynamic = 'force-dynamic'

export default function Home() {
  const showMobileStack = isMobileAppViewEnabled()
  const business = getArticlesByCategory('business', 3)
  const markets = getArticlesByCategory('markets', 3)
  const technology = getArticlesByCategory('technology', 3)
  const sports = getArticlesByCategory('sports', 3)
  const topStories = getTopHeadlines(4)
  const liveDesk = getAllArticles().slice(4, 10)
  const world = getArticlesByCategory('world', 4)
  const politics = getArticlesByCategory('politics', 4)
  const explainers = getAllArticles().slice(2, 7)
  const webStories = getAllArticles().slice(0, 8)
  const lifestyleColumns = [
    {
      title: 'ఆరోగ్యము',
      accent: 'bg-red-600',
      items: getAllArticles().slice(0, 4)
    },
    {
      title: 'ఆధ్యాత్మికం',
      accent: 'bg-amber-500',
      items: world.slice(0, 4)
    },
    {
      title: 'కుటుంబ జీవితం',
      accent: 'bg-rose-500',
      items: getAllArticles().slice(4, 8)
    }
  ]

  return (
    <main className="py-4">
      {/* Mobile 9:16 swipe-style stack */}
      {showMobileStack && (
        <div className="md:hidden">
          <MobileCardStack />
        </div>
      )}

      {/* Desktop/Tablet classic layout */}
      <div className={`${showMobileStack ? 'hidden' : 'block'} md:block space-y-8`}>
        {/* Horizontal ad banner below header */}
        <section aria-label="Horizontal Ads" className="mt-3">
          <AdBanner height={120} />
        </section>
        {/* Disha-style 3-column layout */}
        <div id="hero">
          <HeroDaily />
        </div>
        {/* Separator divider after hero */}
        <section aria-hidden="true" className="my-6">
          <hr className="border-t border-gray-200 dark:border-gray-800" />
        </section>
        {/* Web Stories carousel */}
        <section id="webstories" className="space-y-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Web Stories</p>
              <h2 className="text-2xl font-black">వీక్షకుల ప్రీతికి వెబ్ స్టోరీస్</h2>
            </div>
            <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 overflow-x-auto">
              {['Tollywood', 'News', 'Lifestyle', 'Bollywood', 'Sports', 'Religion'].map(tab => (
                <span key={tab} className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-200 whitespace-nowrap">
                  {tab}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {webStories.map(item => (
              <Link
                key={item.id}
                href={`/article/${item.slug}`}
                className="snap-start min-w-[180px] max-w-[200px] bg-gray-900 text-white rounded-3xl overflow-hidden relative"
              >
                <img src={item.thumb || item.hero} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
                <div className="relative p-4 space-y-3 h-48 flex flex-col justify-end">
                  <span className="inline-flex items-center text-[11px] uppercase tracking-[0.3em] text-white/80">WD</span>
                  <p className="text-base font-semibold leading-snug line-clamp-3">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Lifestyle three-column grid */}
        <section id="lifestyle" className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">ఆరోగ్యం • ఆధ్యాత్మికం • జీవితం</h2>
            <Link href="/category/latest" className="text-sm font-semibold text-red-600 hover:underline">మరిన్ని కథలు →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            {lifestyleColumns.map(col => (
              <div key={col.title}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-1.5 w-10 rounded-full ${col.accent}`} aria-hidden />
                  <p className="text-lg font-bold">{col.title}</p>
                </div>
                <div className="space-y-3">
                  {col.items.map(item => (
                    <article key={item.id} className="flex gap-3">
                      <img src={item.thumb || item.hero} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <Link href={`/article/${item.slug}`} className="text-sm font-semibold leading-snug hover:text-red-600">
                          {item.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* 2nd section: configurable 3-column rows */}
        <section id="breaking" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-red-500">Breaking Desk</p>
              <h2 className="text-3xl font-black">Top headlines from the classic newsroom</h2>
            </div>
            <Link href="/category/latest" className="text-sm font-semibold text-red-600 hover:underline">View latest →</Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {topStories[0] && (
              <article className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gray-900 text-white min-h-[320px]">
                <img src={topStories[0].hero || topStories[0].thumb} alt={topStories[0].title} className="absolute inset-0 h-full w-full object-cover opacity-60" />
                <div className="relative p-8 space-y-4">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/80">Prime</span>
                  <Link href={`/article/${topStories[0].slug}`} className="text-3xl font-black leading-snug block">
                    {topStories[0].title}
                  </Link>
                  <p className="text-sm text-white/90 line-clamp-3">{topStories[0].summary}</p>
                  <div className="text-xs text-white/80 flex items-center gap-2">
                    <span>{topStories[0].reporter.name}</span>
                    <span>•</span>
                    <time>{new Date(topStories[0].publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                </div>
              </article>
            )}
            <div className="space-y-4">
              {topStories.slice(1).map(item => (
                <article key={item.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500">Top Story</p>
                  <Link href={`/article/${item.slug}`} className="mt-2 block text-lg font-semibold leading-snug hover:text-red-600">
                    {item.title}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div id="markets" className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Live ticker</p>
                <h3 className="text-xl font-bold">Minute-by-minute newsroom updates</h3>
              </div>
              <span className="text-sm text-gray-500">Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveDesk.map(item => (
                <article key={item.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                  <p className="text-[11px] uppercase tracking-widest text-gray-400">{item.category.name}</p>
                  <Link href={`/article/${item.slug}`} className="block text-base font-semibold leading-snug">{item.title}</Link>
                  <div className="text-xs text-gray-500 mt-1">{item.readTime} min read</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ThreeColNews />

        {/* 3rd section: Business pulse & market lens */}
        <section id="business" className="mt-8 bg-gradient-to-br from-amber-50 via-white to-rose-50 dark:from-amber-900/20 dark:via-slate-900 dark:to-rose-900/10 border border-amber-100 dark:border-amber-900/40 rounded-3xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500 dark:text-amber-300">Business Pulse</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Morning boardroom brief</h2>
            </div>
            <button className="text-sm font-semibold text-amber-600 dark:text-amber-300 hover:underline">See more markets →</button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {business.map(item => (
                <article key={item.id} className="rounded-2xl bg-white/80 dark:bg-slate-900/60 shadow-sm ring-1 ring-white/60 dark:ring-white/10 p-4 hover:translate-y-[-2px] transition">
                  <p className="text-xs uppercase text-amber-600 dark:text-amber-300 tracking-widest">{item.category.name}</p>
                  <Link href={`/article/${item.slug}`} className="mt-1 block text-lg font-semibold text-gray-900 dark:text-white leading-snug">{item.title}</Link>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.summary}</p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>{item.reporter.name}</span>
                    <span className="text-gray-400">•</span>
                    <span>{item.readTime} min read</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="space-y-4">
              {markets.map((item, idx) => (
                <article key={item.id} className="flex gap-4 rounded-2xl border border-amber-100 dark:border-white/10 bg-white/60 dark:bg-slate-950/40 p-4">
                  <div className="flex-shrink-0 text-3xl font-black text-amber-300">0{idx + 1}</div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-300">Market lens</p>
                    <Link href={`/article/${item.slug}`} className="block text-lg font-semibold text-gray-900 dark:text-white leading-snug">{item.title}</Link>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4th section: Tech + sports energy */}
        <section id="innovation" className="mt-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-300">Innovation & Arena</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Tech sparks & matchday rush</h2>
            </div>
            <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:underline">View full coverage →</button>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {technology.map(item => (
                <article key={item.id} className="group relative overflow-hidden rounded-2xl bg-gray-900 text-white">
                  <img src={item.hero || item.thumb} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-80 transition" />
                  <div className="relative p-5 space-y-3">
                    <span className="inline-flex items-center text-[11px] uppercase tracking-[0.3em] text-white/80">Tech</span>
                    <Link href={`/article/${item.slug}`} className="block text-xl font-semibold leading-snug">{item.title}</Link>
                    <p className="text-sm text-white/90 line-clamp-2">{item.summary}</p>
                  </div>
                </article>
              ))}
            </div>
            <div id="sports" className="space-y-4">
              {sports.map(item => (
                <article key={item.id} className="rounded-2xl bg-white dark:bg-slate-950/60 border border-indigo-100 dark:border-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300">Sports desk</p>
                  <Link href={`/article/${item.slug}`} className="mt-2 block text-lg font-semibold text-gray-900 dark:text-white">{item.title}</Link>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.reporter.name}</span>
                    <span>{item.readTime} min read</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5th section: World + politics depth */}
        <section id="world" className="mt-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-500">Global & Parliament watch</p>
              <h2 className="text-2xl font-black">World view and policy tracker</h2>
            </div>
            <Link href="/category/world" className="text-sm font-semibold text-blue-600 hover:underline">Full world coverage →</Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {world.map(item => (
                <article key={item.id} className="flex gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                  <img src={item.thumb || item.hero} alt={item.title} className="w-32 h-24 rounded-lg object-cover" />
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-gray-400">{item.category.name}</p>
                    <Link href={`/article/${item.slug}`} className="block text-lg font-semibold leading-snug">{item.title}</Link>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.summary}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 p-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-blue-600">Policy pulse</p>
                <h3 className="text-xl font-semibold">Parliament highlights</h3>
                <div className="mt-3 space-y-3">
                  {politics.map(item => (
                    <Link key={item.id} href={`/article/${item.slug}`} className="block text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Explainers</p>
                {explainers.slice(0, 3).map(item => (
                  <Link key={item.id} href={`/article/${item.slug}`} className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6th section: Insight + engagement */}
        <section id="insights" className="mt-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white via-slate-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Editor's picks</p>
              <h3 className="text-xl font-bold">Weekend reading list</h3>
              <div className="mt-4 space-y-3">
                {explainers.slice(0, 3).map(item => (
                  <Link key={item.id} href={`/article/${item.slug}`} className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">City focus</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                {['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Tirupati', 'Warangal', 'Karimnagar'].map(city => (
                  <li key={city}>
                    <Link href={`/?city=${encodeURIComponent(city.toLowerCase())}#breaking`} className="hover:underline">{city} Updates</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Newsletter</p>
              <h3 className="text-xl font-bold">Get the 7am edition</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Actionable market cues and explainers in your inbox.</p>
              <form className="mt-4 space-y-3">
                <input type="email" placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
                <button className="w-full rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-2 text-sm font-semibold">Subscribe</button>
              </form>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Tags</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                {['Elections 2025', 'AI', 'Stock Markets', 'Hyderabad Metro', 'Education', 'Jobs'].map(tag => (
                  <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

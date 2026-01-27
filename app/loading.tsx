/**
 * Homepage Loading Skeleton
 * Shown while config and data are being fetched
 */

/**
 * Style2 (TOI-style) Homepage Skeleton
 */
export function Style2Skeleton() {
  return (
    <div className="theme-style2 min-h-screen bg-white animate-pulse pb-16 sm:pb-0">
      {/* Navbar Skeleton */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Logo skeleton */}
            <div className="h-8 w-32 bg-zinc-200 rounded" />
            
            {/* Nav items - hidden on mobile */}
            <div className="hidden md:flex gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-3 w-16 bg-zinc-200 rounded" />
              ))}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden h-8 w-8 bg-zinc-200 rounded" />
          </div>
        </div>
      </header>

      {/* Flash Ticker Skeleton */}
      <div className="bg-red-600 border-b border-red-700">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 bg-red-400 rounded" />
            <div className="flex-1 h-4 bg-red-400 rounded" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
          {/* Left Side - Hero + Secondary Grid */}
          <div className="space-y-6">
            {/* Hero Article Skeleton */}
            <div className="bg-white overflow-hidden">
              <div className="aspect-[16/9] bg-zinc-200" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-zinc-200 rounded w-full" />
                <div className="h-6 bg-zinc-200 rounded w-4/5" />
                <div className="h-4 bg-zinc-200 rounded w-3/4 mt-2" />
                <div className="h-3 bg-zinc-200 rounded w-32 mt-2" />
              </div>
            </div>

            {/* Secondary Grid - 8 articles (2×4) */}
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border-b border-zinc-100 pb-3">
                  <div className="flex gap-3">
                    <div className="h-16 w-24 shrink-0 bg-zinc-200" />
                    <div className="flex-1 flex flex-col justify-center space-y-2">
                      <div className="h-4 bg-zinc-200 rounded w-full" />
                      <div className="h-4 bg-zinc-200 rounded w-3/4" />
                      <div className="h-3 bg-zinc-200 rounded w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Widgets */}
          <aside className="space-y-6">
            {/* Trending Widget Skeleton */}
            <div className="bg-white border border-zinc-200">
              <div className="bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5">
                <div className="h-4 w-32 bg-red-400 rounded" />
              </div>
              <div className="divide-y divide-zinc-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <div className="w-6 h-6 bg-red-200 rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-zinc-200 rounded w-full" />
                      <div className="h-4 bg-zinc-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Widget Skeleton */}
            <div className="bg-white border border-zinc-200">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5">
                <div className="h-4 w-24 bg-blue-400 rounded" />
              </div>
              <div className="divide-y divide-zinc-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-3">
                    <div className="h-4 bg-zinc-200 rounded w-full" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Category Sections Skeleton */}
        <div className="mt-8 space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-t border-zinc-200 pt-6">
              <div className="h-6 w-40 bg-red-500 rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="aspect-[16/9] bg-zinc-200 rounded" />
                    <div className="h-4 bg-zinc-200 rounded w-full" />
                    <div className="h-4 bg-zinc-200 rounded w-4/5" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

/**
 * Style1 Homepage Skeleton
 */
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 animate-pulse">
      {/* Navbar Skeleton */}
      <header className="w-full border-b border-zinc-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between sm:h-20">
            {/* Logo skeleton */}
            <div className="h-10 w-32 bg-zinc-200 rounded-md sm:h-12 sm:w-40" />
            
            {/* Nav items skeleton - hidden on mobile */}
            <div className="hidden sm:flex gap-6">
              <div className="h-4 w-16 bg-zinc-200 rounded" />
              <div className="h-4 w-20 bg-zinc-200 rounded" />
              <div className="h-4 w-24 bg-zinc-200 rounded" />
              <div className="h-4 w-20 bg-zinc-200 rounded" />
              <div className="h-4 w-16 bg-zinc-200 rounded" />
            </div>
            
            {/* Mobile menu button skeleton */}
            <div className="sm:hidden h-8 w-8 bg-zinc-200 rounded" />
          </div>
        </div>
      </header>

      {/* Ticker Skeleton */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 bg-red-200 rounded" />
            <div className="flex-1 h-5 bg-zinc-200 rounded" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Hero Grid - 4 columns */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6 mb-8">
          {/* Column 1 - Large hero */}
          <div className="space-y-4">
            <div className="rounded-lg bg-white shadow-md overflow-hidden">
              <div className="aspect-video bg-zinc-200" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-zinc-200 rounded w-3/4" />
                <div className="h-5 bg-zinc-200 rounded w-full" />
                <div className="h-5 bg-zinc-200 rounded w-2/3" />
              </div>
            </div>
          </div>

          {/* Column 2 - Medium cards */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white shadow-sm overflow-hidden">
                <div className="aspect-video bg-zinc-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-full" />
                  <div className="h-4 bg-zinc-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>

          {/* Column 3 - List items */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-3 bg-white rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-full" />
                  <div className="h-4 bg-zinc-200 rounded w-2/3" />
                </div>
                <div className="h-16 w-16 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>

          {/* Column 4 - Most Read */}
          <div className="rounded-lg bg-white p-4">
            <div className="h-5 w-24 bg-red-200 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-full" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  </div>
                  <div className="h-16 w-16 bg-zinc-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Ad Skeleton */}
        <div className="mb-8 rounded-xl bg-zinc-200 h-24 lg:h-32" />

        {/* Category Columns Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="rounded-xl bg-white overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="h-4 w-24 bg-zinc-200 rounded" />
                <div className="h-6 w-20 bg-zinc-200 rounded-full" />
              </div>
              
              {/* Featured article */}
              <div className="p-3 space-y-2">
                <div className="aspect-video bg-zinc-200 rounded" />
                <div className="h-4 bg-zinc-200 rounded w-full" />
                <div className="h-4 bg-zinc-200 rounded w-3/4" />
              </div>

              {/* List items */}
              <div className="space-y-3 px-3 pb-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-zinc-100 last:border-0">
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-zinc-200 rounded w-full" />
                      <div className="h-3 bg-zinc-200 rounded w-2/3" />
                    </div>
                    <div className="h-16 w-24 bg-zinc-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="mt-12 bg-zinc-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-32 bg-zinc-700 rounded" />
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-700 rounded w-3/4" />
                  <div className="h-3 bg-zinc-700 rounded w-2/3" />
                  <div className="h-3 bg-zinc-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/**
 * Simple loading component
 */
export default function Loading() {
  // Show a minimal universal skeleton that works for all themes
  return (
    <div className="min-h-screen bg-zinc-50 animate-pulse">
      {/* Universal Navbar Skeleton */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="h-10 w-32 bg-zinc-200 rounded" />
            <div className="hidden md:flex gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 w-16 bg-zinc-200 rounded" />
              ))}
            </div>
            <div className="md:hidden h-8 w-8 bg-zinc-200 rounded" />
          </div>
        </div>
      </header>

      {/* Ticker Skeleton */}
      <div className="bg-red-600 border-b">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 bg-red-400 rounded" />
            <div className="flex-1 h-4 bg-red-400 rounded" />
          </div>
        </div>
      </div>

      {/* Main Content - Works for both Style1 and Style2 */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
          {/* Left - Hero + Articles */}
          <div className="space-y-6">
            {/* Hero */}
            <div className="bg-white rounded overflow-hidden shadow-sm">
              <div className="aspect-[16/9] bg-zinc-200" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-zinc-200 rounded w-full" />
                <div className="h-6 bg-zinc-200 rounded w-4/5" />
                <div className="h-4 bg-zinc-200 rounded w-3/4" />
              </div>
            </div>

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded shadow-sm overflow-hidden">
                  <div className="aspect-video bg-zinc-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-full" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded">
              <div className="bg-red-500 px-4 py-2.5">
                <div className="h-4 w-32 bg-red-300 rounded" />
              </div>
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-zinc-200 rounded" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

// Export theme-specific skeletons for use in Suspense boundaries
export { Style2Skeleton, HomePageSkeleton as Style1Skeleton }

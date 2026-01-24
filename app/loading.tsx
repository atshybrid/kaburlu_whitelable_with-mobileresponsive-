/**
 * Homepage Loading Skeleton
 * Shown while config and data are being fetched
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
  return <HomePageSkeleton />
}

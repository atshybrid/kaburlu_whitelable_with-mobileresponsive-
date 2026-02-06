/**
 * Article Page Loading Skeleton (SEO-friendly route)
 *
 * This overrides the root app/loading.tsx (homepage skeleton) so article routes
 * show an article-shaped animated skeleton while data loads.
 */

function S({ className }: { className: string }) {
  return <div className={`skeleton-shimmer ${className}`} />
}

export default function Loading() {

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20">
          <S className="h-10 w-32 rounded-md" />
          <div className="hidden items-center gap-6 sm:flex">
            <S className="h-4 w-16 rounded" />
            <S className="h-4 w-20 rounded" />
            <S className="h-4 w-24 rounded" />
            <S className="h-4 w-20 rounded" />
          </div>
          <S className="h-9 w-9 rounded sm:hidden" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <S className="h-3 w-20 rounded" />
          <S className="h-3 w-3 rounded" />
          <S className="h-3 w-24 rounded" />
          <S className="h-3 w-3 rounded" />
          <S className="h-3 w-40 rounded" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main article */}
          <article className="min-w-0">
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="p-6 sm:px-8 lg:px-10">
                {/* Category badge */}
                <S className="mb-4 h-8 w-28 rounded-full" />

                {/* Title */}
                <S className="h-9 w-full rounded" />
                <S className="mt-3 h-9 w-11/12 rounded" />
                <S className="mt-3 h-9 w-4/5 rounded" />

                {/* Subtitle */}
                <S className="mt-6 h-5 w-4/5 rounded" />
                <S className="mt-2 h-5 w-3/5 rounded" />

                {/* Meta row */}
                <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-zinc-200 pb-6">
                  <div className="flex items-center gap-2">
                    <S className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <S className="h-3 w-14 rounded" />
                      <S className="h-4 w-28 rounded" />
                    </div>
                  </div>
                  <S className="h-6 w-px rounded bg-zinc-200" />
                  <S className="h-4 w-32 rounded" />
                  <S className="h-6 w-px rounded bg-zinc-200" />
                  <S className="h-4 w-24 rounded" />
                </div>

                {/* Share buttons */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <S className="h-9 w-28 rounded-full" />
                  <S className="h-9 w-28 rounded-full" />
                  <S className="h-9 w-28 rounded-full" />
                </div>
              </div>

              {/* Featured image */}
              <div className="px-6 sm:px-8 lg:px-10">
                <S className="aspect-video w-full rounded-xl" />
              </div>

              {/* Content */}
              <div className="px-6 pb-8 pt-8 sm:px-8 lg:px-10">
                <div className="space-y-4">
                  <S className="h-4 w-full rounded" />
                  <S className="h-4 w-11/12 rounded" />
                  <S className="h-4 w-10/12 rounded" />
                  <S className="h-4 w-full rounded" />
                  <S className="h-4 w-9/12 rounded" />
                  <S className="mt-6 h-64 w-full rounded-xl" />
                  <S className="h-4 w-full rounded" />
                  <S className="h-4 w-11/12 rounded" />
                  <S className="h-4 w-10/12 rounded" />
                </div>
              </div>

              {/* Reporter card placeholder */}
              <div className="border-t border-zinc-200 px-6 py-8 sm:px-8 lg:px-10">
                <S className="mb-4 h-6 w-32 rounded" />
                <div className="flex items-start gap-4">
                  <S className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <S className="h-5 w-48 rounded" />
                    <S className="h-4 w-32 rounded" />
                    <S className="h-4 w-full rounded" />
                    <S className="h-4 w-10/12 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Related section */}
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <S className="mb-6 h-7 w-48 rounded" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-zinc-100 bg-white">
                    <S className="aspect-video w-full" />
                    <div className="p-4 space-y-3">
                      <S className="h-4 w-full rounded" />
                      <S className="h-4 w-4/5 rounded" />
                      <S className="h-3 w-24 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <S className="mb-4 h-5 w-32 rounded" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <S className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <S className="h-4 w-full rounded" />
                      <S className="h-4 w-4/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <S className="mb-4 h-5 w-28 rounded" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <S className="h-4 w-full rounded" />
                    <S className="h-4 w-3/4 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

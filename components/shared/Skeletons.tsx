export function HeroSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg bg-white shadow-md">
      <div className="relative aspect-video w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export function CardMediumSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg bg-white shadow-sm border border-zinc-100">
      <div className="relative aspect-video w-full bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}

export function ListRowSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-[1fr_auto] items-center gap-3 py-2.5">
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="h-14 w-20 bg-gray-200 rounded" />
    </div>
  )
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-lg" />
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/3 mt-3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CategoryBlockSkeleton() {
  return (
    <section className="mb-8 rounded-xl bg-white animate-pulse">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-6 bg-gray-200 rounded-full w-24" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="h-17 w-25 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function FlashTickerSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2 animate-pulse">
      <div className="h-6 w-20 bg-gray-300 rounded" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}

export function NavbarSkeleton() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between sm:h-20 animate-pulse">
          <div className="h-10 w-32 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded" />
        </div>
      </div>
    </header>
  )
}

export function MainGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
      <div className="space-y-6">
        <HeroSkeleton />
        <div className="grid grid-cols-2 gap-4">
          <CardMediumSkeleton />
          <CardMediumSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      </div>
      <CategoryBlockSkeleton />
      <CategoryBlockSkeleton />
      <CategoryBlockSkeleton />
    </div>
  )
}

/* ==================== STYLE2 SKELETON COMPONENTS ==================== */

export function Style2HeroSkeleton() {
  return (
    <div className="animate-pulse bg-white overflow-hidden">
      {/* Hero Image */}
      <div className="relative aspect-[16/9] w-full bg-zinc-200">
        <div className="absolute top-3 left-3 px-2 py-1 bg-zinc-300 w-20 h-6 rounded" />
      </div>
      {/* Text */}
      <div className="p-4 space-y-3">
        <div className="h-6 bg-zinc-200 rounded w-full" />
        <div className="h-6 bg-zinc-200 rounded w-4/5" />
        <div className="h-4 bg-zinc-200 rounded w-3/5 mt-2" />
        <div className="h-3 bg-zinc-200 rounded w-1/3 mt-2" />
      </div>
    </div>
  )
}

export function Style2SecondaryCardSkeleton() {
  return (
    <div className="animate-pulse border-b border-zinc-100 pb-3 last:border-b-0">
      <div className="flex gap-3">
        <div className="h-16 w-24 shrink-0 bg-zinc-200 rounded" />
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
          <div className="h-4 bg-zinc-200 rounded w-full" />
          <div className="h-4 bg-zinc-200 rounded w-3/4" />
          <div className="h-3 bg-zinc-200 rounded w-1/4 mt-1" />
        </div>
      </div>
    </div>
  )
}

export function Style2WidgetSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-200 px-4 py-3 animate-pulse">
        <div className="h-4 bg-zinc-300 rounded w-32" />
      </div>
      {/* Items */}
      <div className="divide-y divide-zinc-100">
        {[...Array(rows)].map((_, idx) => (
          <div key={idx} className="p-3 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-zinc-200 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-zinc-200 rounded w-full" />
                <div className="h-3 bg-zinc-200 rounded w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Style2CategoryColumnSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-zinc-200 px-4 py-2.5">
        <div className="h-4 bg-zinc-300 rounded w-24" />
      </div>
      {/* Items */}
      <div className="p-3 divide-y divide-zinc-100">
        {[...Array(5)].map((_, idx) => (
          <Style2SecondaryCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  )
}

export function Style2MagazineGridSkeleton() {
  return (
    <section className="py-8 animate-pulse">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-8 rounded-full bg-zinc-300" />
        <div className="h-6 bg-zinc-200 rounded w-40" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Main large article */}
        <div className="relative overflow-hidden rounded-xl bg-zinc-200">
          <div className="aspect-[16/10] w-full" />
        </div>
        
        {/* Side articles */}
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-4 bg-zinc-200 rounded w-full" />
              <div className="h-4 bg-zinc-200 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 rounded w-1/4 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Style2HeroSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
      {/* Main Content Area - Left Side */}
      <div className="space-y-6">
        <Style2HeroSkeleton />
        
        {/* Secondary Stories Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(8)].map((_, idx) => (
            <Style2SecondaryCardSkeleton key={idx} />
          ))}
        </div>
      </div>

      {/* Sidebar - Right Side */}
      <div className="space-y-6">
        <Style2WidgetSkeleton rows={5} />
        <Style2WidgetSkeleton rows={6} />
      </div>
    </div>
  )
}

export function Style2ThreeColumnGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {[...Array(3)].map((_, idx) => (
        <Style2CategoryColumnSkeleton key={idx} />
      ))}
    </div>
  )
}

export function Style2FullPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      {/* Hero Section */}
      <Style2HeroSectionSkeleton />
      
      {/* Three Column Grid */}
      <Style2ThreeColumnGridSkeleton />
      
      {/* Magazine Sections */}
      <Style2MagazineGridSkeleton />
      <Style2MagazineGridSkeleton />
    </div>
  )
}

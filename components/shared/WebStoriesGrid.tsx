
type GridItem = {
  url: string
  title: string
  poster: string
}

export function WebStoriesGrid({ items = [] }: { items?: GridItem[] }) {
  if (!items.length) return null
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((s, i) => (
        <a key={`${s.url}-${i}`} href={s.url} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-xl">
          <div className="relative aspect-9/16 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.poster} alt={s.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            {/* top-left play badge */}
            <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white shadow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {/* bottom gradient title */}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black to-transparent p-3">
              <div className="line-clamp-2 text-sm font-semibold text-white">{s.title}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

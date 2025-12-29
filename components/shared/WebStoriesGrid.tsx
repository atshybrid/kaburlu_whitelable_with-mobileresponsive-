
type GridItem = {
  url: string
  title: string
  poster: string
}

const SAMPLE_STORIES: GridItem[] = [
  {
    url: "https://www.gstatic.com/amphtml/stamp/qa/media/animal-photo-essay/amp_story.html",
    title: "Animal Photo Essay",
    poster: "https://www.gstatic.com/amphtml/stamp/qa/media/animal-photo-essay/cover.jpg",
  },
  {
    url: "https://www.gstatic.com/amphtml/stamp/qa/media/kitchen-sink/amp_story.html",
    title: "Kitchen Sink",
    poster: "https://www.gstatic.com/amphtml/stamp/qa/media/kitchen-sink/cover.jpg",
  },
  {
    url: "https://www.gstatic.com/amphtml/stamp/qa/media/thescenic/amp_story.html",
    title: "The Scenic",
    poster: "https://www.gstatic.com/amphtml/stamp/qa/media/thescenic/cover.jpg",
  },
  {
    url: "https://www.gstatic.com/amphtml/stamp/qa/media/healthy-food/amp_story.html",
    title: "Healthy Food",
    poster: "https://www.gstatic.com/amphtml/stamp/qa/media/healthy-food/cover.jpg",
  },
  {
    url: "https://www.gstatic.com/amphtml/stamp/qa/media/animal-photo-essay/amp_story.html",
    title: "Wildlife Moments",
    poster: "https://www.gstatic.com/amphtml/stamp/qa/media/animal-photo-essay/cover.jpg",
  },
  {
    url: "https://www.gstatic.com/amphtml/stamp/qa/media/kitchen-sink/amp_story.html",
    title: "Daily Mix",
    poster: "https://www.gstatic.com/amphtml/stamp/qa/media/kitchen-sink/cover.jpg",
  },
  {
    url: "https://www.gstatic.com/amphtml/stamp/qa/media/thescenic/amp_story.html",
    title: "Scenic Trails",
    poster: "https://www.gstatic.com/amphtml/stamp/qa/media/thescenic/cover.jpg",
  },
  {
    url: "https://www.gstatic.com/amphtml/stamp/qa/media/healthy-food/amp_story.html",
    title: "Eat Fresh",
    poster: "https://www.gstatic.com/amphtml/stamp/qa/media/healthy-food/cover.jpg",
  },
]

export function WebStoriesGrid({ items = SAMPLE_STORIES }: { items?: GridItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((s, i) => (
        <a key={`${s.url}-${i}`} href={s.url} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-xl">
          <div className="relative aspect-[9/16] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.poster} alt={s.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            {/* top-left play badge */}
            <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white shadow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {/* bottom gradient title */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-3">
              <div className="line-clamp-2 text-sm font-semibold text-white">{s.title}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

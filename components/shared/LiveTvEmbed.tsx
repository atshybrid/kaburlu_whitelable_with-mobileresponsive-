export function LiveTvEmbed() {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border bg-black">
      <iframe
        className="h-full w-full"
        src="https://www.youtube.com/embed/live_stream?channel=UCARuQK7lJc7MZJQd1F6T6yw"
        title="Live TV"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

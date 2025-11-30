"use client"
import ShareButton from './ShareButton'

export default function StickyShareBar({ title, path, image }: { title: string; path: string; image?: string }) {
  return (
    <div className="hidden lg:block fixed left-4 top-1/3 z-30">
      <div className="flex flex-col gap-2 p-2 rounded-xl bg-white/90 backdrop-blur border shadow-sm">
        <ShareButton title={title} slug={path} path={path} image={image} className="px-2 py-1 text-xs rounded bg-indigo-600 text-white" />
        <button
          onClick={() => {
            navigator.clipboard?.writeText((process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '') + path)
          }}
          className="px-2 py-1 text-xs rounded bg-gray-900 text-white"
        >Copy</button>
      </div>
    </div>
  )
}

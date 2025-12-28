"use client"
import { useState } from 'react'

type Props = {
  homeHref: string
  latestHref?: string
  categories: Array<{ label: string; href: string }>
}

export default function MobileBottomNavClient({ homeHref, latestHref, categories }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      {/* Bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl items-stretch justify-between px-4">
          <a href={homeHref} className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 10h2v10h6v-6h2v6h6V10h2L12 3Z"/></svg>
            <span>Home</span>
          </a>
          <a href={latestHref || homeHref} className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h12v2H3v-2Z"/></svg>
            <span>Latest</span>
          </a>
          <button type="button" onClick={() => setOpen(true)} className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"/></svg>
            <span>Categories</span>
          </button>
          <a href="#top" className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m12 5 7 7-1.4 1.4L13 9.8V19h-2V9.8L6.4 13.4 5 12l7-7Z"/></svg>
            <span>Top</span>
          </a>
        </div>
      </nav>

      {/* Categories sheet */}
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
                <span className="text-sm font-bold uppercase tracking-wide">Categories</span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md border px-2 py-1 text-xs">Close</button>
            </div>
            <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-auto">
              {categories.map((c) => (
                <a key={c.href} href={c.href} className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-zinc-50">
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

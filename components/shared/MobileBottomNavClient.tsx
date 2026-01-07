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
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-7xl items-stretch justify-between">
          <a href={homeHref} className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-zinc-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 10h2v10h6v-6h2v6h6V10h2L12 3Z"/></svg>
            <span>Home</span>
          </a>
          <a href={latestHref || homeHref} className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-zinc-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            <span>Latest</span>
          </a>
          <button type="button" onClick={() => setOpen(true)} className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-zinc-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            <span>Categories</span>
          </button>
          <a href="#top" className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-zinc-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="m12 4-8 8 1.4 1.4L12 6.8l6.6 6.6L20 12l-8-8z"/></svg>
            <span>Top</span>
          </a>
        </div>
      </nav>

      {/* Categories sheet */}
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white shadow-2xl">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
            </div>
            <div className="px-4 pb-2 flex items-center justify-between border-b border-zinc-100">
              <div className="inline-flex items-center gap-2">
                <span className="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-blue-500" />
                <span className="text-base font-bold tracking-tight text-zinc-800">Categories</span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-zinc-100 hover:bg-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-600 transition-colors">
                Close
              </button>
            </div>
            <div className="grid max-h-[65vh] grid-cols-2 gap-2 overflow-auto p-4">
              {categories.map((c) => (
                <a 
                  key={c.href} 
                  href={c.href} 
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {c.label}
                </a>
              ))}
            </div>
            <div className="h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  )
}

"use client"
import Link from 'next/link'
import type { Route } from 'next'
import { useEffect, useRef, useState } from 'react'

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

export default function NavbarMenuClient({ items }: { items: { href: string; label: string }[] }) {
  const visible = items.slice(0, 10)
  const rest = items.slice(10)
  const [open, setOpen] = useState(false)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <nav className="flex items-center gap-3 overflow-x-auto py-2 text-sm">
      {visible.map((it) => (
        <Link
          key={it.href}
          href={it.href as unknown as Route}
          aria-label={it.label === 'Home' ? 'Home' : undefined}
          title={it.label === 'Home' ? 'Home' : undefined}
          className="whitespace-nowrap font-medium text-zinc-800 hover:text-[hsl(var(--accent))]"
        >
          {it.label === 'Home' ? <HomeIcon className="h-4 w-4" /> : it.label}
        </Link>
      ))}
      {rest.length > 0 && (
        <div className="relative" ref={popRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            More
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {open && (
            <div role="menu" className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-white p-2 shadow-lg">
              <div className="grid max-h-64 grid-cols-1 gap-1 overflow-auto">
                {rest.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href as unknown as Route}
                    className="rounded px-2 py-1 text-sm text-zinc-800 hover:bg-gray-50 hover:text-[hsl(var(--accent))]"
                    onClick={() => setOpen(false)}
                  >
                    {it.label === 'Home' ? (
                      <span className="inline-flex items-center gap-2">
                        <HomeIcon className="h-4 w-4" />
                        Home
                      </span>
                    ) : (
                      it.label
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

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

export default function NavbarMenuClient({
  items,
}: {
  items: Array<{ href: string; label: string; children?: Array<{ href: string; label: string }> }>
}) {
  const visible = items.slice(0, 10)
  const rest = items.slice(10)
  const [openMore, setOpenMore] = useState(false)
  const [openItemHref, setOpenItemHref] = useState<string | null>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (openMore && moreRef.current && !moreRef.current.contains(target)) setOpenMore(false)
      if (openItemHref) {
        const el = document.querySelector(`[data-nav-dropdown="${CSS.escape(openItemHref)}"]`)
        if (el && !el.contains(target)) setOpenItemHref(null)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenMore(false)
        setOpenItemHref(null)
      }
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMore, openItemHref])

  function renderLink(it: { href: string; label: string }) {
    return (
      <Link
        key={it.href}
        href={it.href as unknown as Route}
        aria-label={it.label === 'Home' ? 'Home' : undefined}
        title={it.label === 'Home' ? 'Home' : undefined}
        className="whitespace-nowrap font-medium text-zinc-800 hover:text-[hsl(var(--accent))]"
      >
        {it.label === 'Home' ? <HomeIcon className="h-4 w-4" /> : it.label}
      </Link>
    )
  }

  function renderItem(it: { href: string; label: string; children?: { href: string; label: string }[] }, compact = false) {
    const kids = Array.isArray(it.children) ? it.children : []
    if (kids.length === 0) return renderLink(it)

    const isOpen = openItemHref === it.href
    const btnClass = compact
      ? 'w-full text-left rounded px-2 py-1 text-sm text-zinc-800 hover:bg-gray-50 hover:text-[hsl(var(--accent))]'
      : 'inline-flex items-center gap-1 whitespace-nowrap font-medium text-zinc-800 hover:text-[hsl(var(--accent))]'

    return (
      <div key={it.href} className="relative" data-nav-dropdown={it.href}>
        {compact ? (
          <Link
            href={it.href as unknown as Route}
            className={btnClass}
            onClick={() => {
              setOpenMore(false)
              setOpenItemHref(null)
            }}
          >
            {it.label}
          </Link>
        ) : (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            onClick={() => setOpenItemHref((cur) => (cur === it.href ? null : it.href))}
            className={btnClass}
          >
            {it.label === 'Home' ? <HomeIcon className="h-4 w-4" /> : it.label}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}

        {/* For compact mode (inside More), render children right under the parent */}
        {compact ? (
          <div className="grid grid-cols-1 gap-1 pl-3">
            {kids.map((k) => (
              <Link
                key={k.href}
                href={k.href as unknown as Route}
                className="rounded px-2 py-1 text-sm text-zinc-700 hover:bg-gray-50 hover:text-[hsl(var(--accent))]"
                onClick={() => {
                  setOpenMore(false)
                  setOpenItemHref(null)
                }}
              >
                {k.label}
              </Link>
            ))}
          </div>
        ) : (
          isOpen && (
            <div role="menu" className="absolute left-0 z-50 mt-2 w-56 rounded-md border bg-white p-2 shadow-lg">
              <div className="grid max-h-64 grid-cols-1 gap-1 overflow-auto">
                {kids.map((k) => (
                  <Link
                    key={k.href}
                    href={k.href as unknown as Route}
                    className="rounded px-2 py-1 text-sm text-zinc-800 hover:bg-gray-50 hover:text-[hsl(var(--accent))]"
                    onClick={() => setOpenItemHref(null)}
                  >
                    {k.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    )
  }

  return (
    <nav className="flex items-center gap-3 overflow-x-auto py-2 text-sm">
      {visible.map((it) => renderItem(it as unknown as { href: string; label: string; children?: { href: string; label: string }[] }))}
      {rest.length > 0 && (
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={openMore}
            onClick={() => setOpenMore((o) => !o)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            More
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${openMore ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {openMore && (
            <div role="menu" className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-white p-2 shadow-lg">
              <div className="grid max-h-64 grid-cols-1 gap-1 overflow-auto">
                {rest.map((it) => {
                  const typed = it as unknown as { href: string; label: string; children?: { href: string; label: string }[] }
                  const kids = Array.isArray(typed.children) ? typed.children : []
                  if (kids.length === 0) {
                    return (
                      <Link
                        key={typed.href}
                        href={typed.href as unknown as Route}
                        className="rounded px-2 py-1 text-sm text-zinc-800 hover:bg-gray-50 hover:text-[hsl(var(--accent))]"
                        onClick={() => setOpenMore(false)}
                      >
                        {typed.label === 'Home' ? (
                          <span className="inline-flex items-center gap-2">
                            <HomeIcon className="h-4 w-4" />
                            Home
                          </span>
                        ) : (
                          typed.label
                        )}
                      </Link>
                    )
                  }

                  return (
                    <div key={typed.href} className="space-y-1">
                      {renderItem(typed, true)}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

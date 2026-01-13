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

function ChevronIcon({ className, isOpen }: { className?: string; isOpen?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${className || ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
}

function CategoryIcon({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export default function NavbarMenuClient({
  items,
}: {
  items: Array<{ href: string; label: string; children?: Array<{ href: string; label: string }> }>
}) {
  const visible = items.slice(0, 6)
  const rest = items.slice(6)
  const [openMore, setOpenMore] = useState(false)
  const [openItemHref, setOpenItemHref] = useState<string | null>(null)
  const [hoveredChild, setHoveredChild] = useState<string | null>(null)
  const moreRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        setHoveredChild(null)
      }
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMore, openItemHref])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleMouseEnter(href: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpenItemHref(href)
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => {
      setOpenItemHref(null)
      setHoveredChild(null)
    }, 150)
  }

  function renderLink(it: { href: string; label: string }) {
    const isHome = it.label === 'Home'
    return (
      <Link
        key={it.href}
        href={it.href as unknown as Route}
        aria-label={isHome ? 'Home' : undefined}
        title={isHome ? 'Home' : undefined}
        className="group relative inline-flex items-center gap-2 whitespace-nowrap font-medium text-[15px] text-zinc-800 hover:text-[hsl(var(--primary,217_91%_60%))] transition-all px-3 py-2.5 rounded-lg flex-shrink-0"
      >
        {isHome ? (
          <HomeIcon className="h-[18px] w-[18px]" />
        ) : (
          it.label
        )}
        <span className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-[hsl(var(--primary,217_91%_60%))] transition-all duration-300 group-hover:w-3/4 group-hover:left-[12.5%]" />
      </Link>
    )
  }

  function renderItem(it: { href: string; label: string; children?: { href: string; label: string }[] }, compact = false) {
    const kids = Array.isArray(it.children) ? it.children : []
    if (kids.length === 0) return renderLink(it)

    const isOpen = openItemHref === it.href
    const isHome = it.label === 'Home'

    // Compact mode for "More" dropdown
    if (compact) {
      return (
        <div key={it.href} className="space-y-2">
          <Link
            href={it.href as unknown as Route}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-semibold text-zinc-900 hover:bg-[hsl(var(--primary,217_91%_60%))]/10 hover:text-[hsl(var(--primary,217_91%_60%))] transition-all"
            onClick={() => {
              setOpenMore(false)
              setOpenItemHref(null)
            }}
          >
            <CategoryIcon className="h-4 w-4 flex-shrink-0" />
            <span>{it.label}</span>
          </Link>
          <div className="grid grid-cols-1 gap-1 pl-6 border-l-2 border-zinc-100 ml-3">
            {kids.map((k) => (
              <Link
                key={k.href}
                href={k.href as unknown as Route}
                className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-[hsl(var(--primary,217_91%_60%))] transition-all"
                onClick={() => {
                  setOpenMore(false)
                  setOpenItemHref(null)
                }}
              >
                {k.label}
              </Link>
            ))}
          </div>
        </div>
      )
    }

    // Mega menu for main navigation
    return (
      <div
        key={it.href}
        className="relative"
        data-nav-dropdown={it.href}
        onMouseEnter={() => handleMouseEnter(it.href)}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setOpenItemHref((cur) => (cur === it.href ? null : it.href))}
          className={`group relative inline-flex items-center gap-2 whitespace-nowrap font-medium text-[15px] transition-all px-3 py-2.5 rounded-lg flex-shrink-0 ${
            isOpen ? 'text-[hsl(var(--primary,217_91%_60%))] bg-[hsl(var(--primary,217_91%_60%))]/5' : 'text-zinc-800 hover:text-[hsl(var(--primary,217_91%_60%))]'
          }`}
        >
          {isHome ? (
            <HomeIcon className="h-[18px] w-[18px]" />
          ) : (
            it.label
          )}
          <ChevronIcon isOpen={isOpen} className="flex-shrink-0" />
          <span className={`absolute bottom-0 left-1/2 h-0.5 transition-all duration-300 ${isOpen ? 'w-3/4 left-[12.5%] bg-[hsl(var(--primary,217_91%_60%))]' : 'w-0 bg-[hsl(var(--primary,217_91%_60%))] group-hover:w-3/4 group-hover:left-[12.5%]'}`} />
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute left-0 z-50 mt-3 min-w-[520px] max-w-2xl rounded-2xl border border-zinc-200/80 bg-white shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => handleMouseEnter(it.href)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Header with parent category */}
            <div className="border-b border-zinc-100 bg-gradient-to-r from-[hsl(var(--primary,217_91%_60%))]/5 to-transparent px-6 py-4">
              <Link
                href={it.href as unknown as Route}
                className="group inline-flex items-center gap-3 text-lg font-bold text-zinc-900 hover:text-[hsl(var(--primary,217_91%_60%))] transition-colors"
                onClick={() => setOpenItemHref(null)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary,217_91%_60%))]/10 group-hover:bg-[hsl(var(--primary,217_91%_60%))]/20 transition-colors">
                  <CategoryIcon className="h-5 w-5 text-[hsl(var(--primary,217_91%_60%))]" />
                </div>
                <span>{it.label}</span>
                <svg className="h-5 w-5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>

            {/* Subcategories grid */}
            <div className="grid grid-cols-2 gap-2 p-4 max-h-[420px] overflow-y-auto custom-scrollbar">
              {kids.map((k, idx) => (
                <Link
                  key={k.href}
                  href={k.href as unknown as Route}
                  className={`group relative flex items-start gap-3 rounded-xl p-4 transition-all duration-200 ${
                    hoveredChild === k.href
                      ? 'bg-[hsl(var(--primary,217_91%_60%))]/10 shadow-md scale-[1.02]'
                      : 'bg-zinc-50/50 hover:bg-[hsl(var(--primary,217_91%_60%))]/10 hover:shadow-md hover:scale-[1.02]'
                  }`}
                  onMouseEnter={() => setHoveredChild(k.href)}
                  onMouseLeave={() => setHoveredChild(null)}
                  onClick={() => {
                    setOpenItemHref(null)
                    setHoveredChild(null)
                  }}
                >
                  {/* Accent bar */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 rounded-r-full bg-[hsl(var(--primary,217_91%_60%))] transition-all duration-200 ${
                    hoveredChild === k.href ? 'h-12' : 'h-0 group-hover:h-8'
                  }`} />
                  
                  {/* Icon with number badge */}
                  <div className="relative flex-shrink-0">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
                      hoveredChild === k.href
                        ? 'bg-[hsl(var(--primary,217_91%_60%))] text-white shadow-lg shadow-[hsl(var(--primary,217_91%_60%))]/30'
                        : 'bg-white text-[hsl(var(--primary,217_91%_60%))] group-hover:bg-[hsl(var(--primary,217_91%_60%))] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[hsl(var(--primary,217_91%_60%))]/30'
                    }`}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white shadow-sm">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[15px] font-semibold leading-tight transition-colors line-clamp-2 ${
                      hoveredChild === k.href ? 'text-[hsl(var(--primary,217_91%_60%))]' : 'text-zinc-900 group-hover:text-[hsl(var(--primary,217_91%_60%))]'
                    }`}>
                      {k.label}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 flex items-center gap-1">
                      <span>Explore</span>
                      <svg className={`h-3 w-3 transition-transform ${hoveredChild === k.href ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All footer */}
            <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-3">
              <Link
                href={it.href as unknown as Route}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary,217_91%_60%))] hover:gap-3 transition-all"
                onClick={() => setOpenItemHref(null)}
              >
                <span>View all in {it.label}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary, 217 91% 60%) / 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary, 217 91% 60%) / 0.5);
        }
        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation-duration: 200ms;
          animation-timing-function: ease-out;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <nav className="flex items-center justify-between gap-0.5 text-sm">
        <div className="flex items-center gap-0.5">
          {visible.map((it) => renderItem(it as unknown as { href: string; label: string; children?: { href: string; label: string }[] }))}
        </div>
        {rest.length > 0 && (
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMore}
              onClick={() => setOpenMore((o) => !o)}
              onMouseEnter={() => setOpenMore(true)}
              onFocus={() => setOpenMore(true)}
              className={`inline-flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 text-[15px] font-bold transition-all shadow-sm ${
                openMore
                  ? 'border-[hsl(var(--primary,217_91%_60%))] bg-[hsl(var(--primary,217_91%_60%))] text-white shadow-lg shadow-[hsl(var(--primary,217_91%_60%))]/30'
                  : 'border-zinc-200 bg-white text-zinc-800 hover:border-[hsl(var(--primary,217_91%_60%))] hover:text-[hsl(var(--primary,217_91%_60%))]'
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
              <span>More</span>
              <ChevronIcon isOpen={openMore} />
            </button>
            {openMore && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border border-zinc-200/80 bg-white shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
                onMouseEnter={() => setOpenMore(true)}
                onMouseLeave={() => setOpenMore(false)}
              >
                <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-transparent px-6 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-500">More Categories</h3>
                </div>
                <div className="grid max-h-[480px] grid-cols-1 gap-2 overflow-auto p-4 custom-scrollbar">
                  {rest.map((it) => {
                    const typed = it as unknown as { href: string; label: string; children?: { href: string; label: string }[] }
                    const kids = Array.isArray(typed.children) ? typed.children : []
                    if (kids.length === 0) {
                      return (
                        <Link
                          key={typed.href}
                          href={typed.href as unknown as Route}
                          className="group flex items-center gap-3 rounded-xl bg-zinc-50/50 px-4 py-3 text-[15px] font-semibold text-zinc-900 hover:bg-[hsl(var(--primary,217_91%_60%))]/10 hover:text-[hsl(var(--primary,217_91%_60%))] transition-all hover:scale-[1.02]"
                          onClick={() => setOpenMore(false)}
                        >
                          {typed.label === 'Home' ? (
                            <>
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white group-hover:bg-[hsl(var(--primary,217_91%_60%))] transition-colors">
                                <HomeIcon className="h-5 w-5 text-[hsl(var(--primary,217_91%_60%))] group-hover:text-white transition-colors" />
                              </div>
                              <span>Home</span>
                            </>
                          ) : (
                            <>
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white group-hover:bg-[hsl(var(--primary,217_91%_60%))] transition-colors">
                                <CategoryIcon className="h-5 w-5 text-[hsl(var(--primary,217_91%_60%))] group-hover:text-white transition-colors" />
                              </div>
                              <span>{typed.label}</span>
                            </>
                          )}
                        </Link>
                      )
                    }

                    return <div key={typed.href}>{renderItem(typed, true)}</div>
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  )
}

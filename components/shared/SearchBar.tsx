"use client"
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function SearchBar({ tenantSlug }: { tenantSlug?: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    if (open) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const basePath = tenantSlug ? `/t/${tenantSlug}` : ''
      router.push(`${basePath}/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Search"
      >
        <svg className="h-5 w-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Search Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-32">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Search Box */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-200">
                <svg className="h-6 w-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, categories..."
                  className="flex-1 text-lg outline-none placeholder:text-zinc-400"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close search"
                >
                  <svg className="h-5 w-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Hints */}
              <div className="p-6 space-y-3">
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Quick tips</div>
                <div className="flex flex-wrap gap-2">
                  {['Politics', 'Business', 'Sports', 'Technology'].map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => setQuery(hint)}
                      className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-sm font-medium text-zinc-700 transition-colors"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
                <div className="pt-3 text-sm text-zinc-500">
                  Press <kbd className="px-2 py-1 bg-zinc-100 rounded text-xs font-mono">Enter</kbd> to search
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

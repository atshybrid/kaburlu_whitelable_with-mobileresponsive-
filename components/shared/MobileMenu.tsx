"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MenuItem {
  href: string
  label: string
  children?: Array<{ href: string; label: string }>
}

export function MobileMenu({ items, homeHref }: { items: MenuItem[]; homeHref?: string }) {
  const [open, setOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Prevent body scroll when menu is open
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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-4 flex justify-between items-center shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900">Menu</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="px-2 py-4" role="navigation" aria-label="Mobile navigation">
              {/* Home Link */}
              {homeHref && (
                <Link
                  href={homeHref}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setOpen(false)}
                >
                  <svg className="h-5 w-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </Link>
              )}

              {/* Menu Items */}
              {items.map((item, index) => (
                <div key={index} className="my-1">
                  {item.children && item.children.length > 0 ? (
                    // Item with submenu
                    <div>
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-zinc-900">{item.label}</span>
                        <svg
                          className={`h-5 w-5 text-zinc-600 transition-transform ${
                            expandedItem === item.label ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedItem === item.label && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children.map((child, childIndex) => (
                            <Link
                              key={childIndex}
                              href={child.href}
                              className="block px-4 py-2 rounded-lg text-sm text-zinc-700 hover:bg-gray-50 hover:text-zinc-900 transition-colors"
                              onClick={() => setOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Simple item
                    <Link
                      href={item.href}
                      className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-zinc-900"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-4 py-4 border-t border-zinc-200">
              <div className="text-xs text-center text-zinc-500">
                © {new Date().getFullYear()} All rights reserved
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

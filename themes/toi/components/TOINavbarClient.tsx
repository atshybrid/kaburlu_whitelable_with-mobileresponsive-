'use client'

import { useState } from 'react'

interface MenuItem {
  href: string
  label: string
  children?: { href: string; label: string }[]
}

export function TOINavbarClient({ items }: { items: MenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="toi-menu-btn lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-xl overflow-y-auto animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-lg">Menu</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="py-2">
              {items.map((item, idx) => (
                <div key={idx} className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <a
                      href={item.href}
                      className="flex-1 px-4 py-3 font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                    {item.children && item.children.length > 0 && (
                      <button
                        className="px-4 py-3 hover:bg-gray-50"
                        onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      >
                        <svg 
                          className={`w-4 h-4 text-gray-500 transition-transform ${expandedIdx === idx ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Submenu */}
                  {item.children && expandedIdx === idx && (
                    <div className="bg-gray-50 py-1">
                      {item.children.map((child, childIdx) => (
                        <a
                          key={childIdx}
                          href={child.href}
                          className="block px-8 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-100"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Language Switch */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-xs text-gray-500 mb-2">Select Language</div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg">
                  English
                </button>
                <button className="flex-1 px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50">
                  తెలుగు
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.25s ease-out forwards;
        }
      `}</style>
    </>
  )
}

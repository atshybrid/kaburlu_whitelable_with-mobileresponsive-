'use client'

import { usePathname } from 'next/navigation'
import { homeHref } from '@/lib/url'

export function TOIMobileNavClient({ tenantSlug }: { tenantSlug: string }) {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === homeHref(tenantSlug)) {
      return pathname === path || pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const navItems = [
    {
      href: homeHref(tenantSlug),
      label: 'Home',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <path d="M9 22V12h6v10"/>
        </svg>
      ),
    },
    {
      href: `${homeHref(tenantSlug)}#trending`,
      label: 'Trending',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
    },
    {
      href: `${homeHref(tenantSlug)}#videos`,
      label: 'Videos',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      ),
    },
    {
      href: `${homeHref(tenantSlug)}#saved`,
      label: 'Saved',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      href: `${homeHref(tenantSlug)}#menu`,
      label: 'Menu',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className="toi-mobile-nav">
      <ul className="toi-mobile-nav-list">
        {navItems.map((item, idx) => (
          <li key={idx}>
            <a 
              href={item.href} 
              className={`toi-mobile-nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <span className="toi-mobile-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

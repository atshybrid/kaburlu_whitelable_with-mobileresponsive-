"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getNavigationConfig, NavLink, NavCTA as NavCTAType, TenantNavigationConfig } from '../lib/navigation'

function formatNow(){
  const now = new Date()
  return now.toLocaleString('en-IN', {weekday:'short', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})
}

export default function HeaderDisha({ showTopBar = true, showTicker = true, brandingLogoUrl }: { showTopBar?: boolean; showTicker?: boolean; brandingLogoUrl?: string }){
  const navConfig = getNavigationConfig()
  // Avoid hydration mismatch by rendering time only on the client after mount
  const [nowText, setNowText] = useState<string>('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useEffect(() => {
    const update = () => setNowText(formatNow())
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Utility strip */}
      {showTopBar && (
      <div className="hidden md:block border-b border-gray-100 dark:border-gray-800/80">
        <div className="max-w-[var(--site-max)] mx-auto px-4 h-9 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
          <div suppressHydrationWarning>{nowText || '\u00A0'}</div>
          <div className="flex items-center gap-2">
            {navConfig.utilityLinks.map(link => (
              <NavItem key={link.label} link={link} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${link.highlight ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`} />
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Logo row */}
      <div className="max-w-[var(--site-max)] mx-auto px-4 py-4 hidden md:flex items-center">
        <Link href="/" className="inline-flex items-center">
          {brandingLogoUrl ? (
            <img src={brandingLogoUrl} alt={navConfig.brand.logoText} className="h-10 md:h-12 w-auto" />
          ) : (
            <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#255db1]">{navConfig.brand.logoText}</span>
          )}
          {navConfig.brand.tagline && <span className="ml-2 text-xs text-gray-500">{navConfig.brand.tagline}</span>}
        </Link>
        {navConfig.cta && (
          <div className="ml-auto"><NavCTA cta={navConfig.cta} /></div>
        )}
      </div>

      {/* Mobile compact header */}
      <div className="md:hidden border-b border-gray-100 dark:border-gray-800/80">
        <div className="px-4 py-3 flex items-center gap-3">
          <button type="button" aria-label="Toggle navigation" onClick={() => setMobileMenuOpen(v => !v)} className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100">
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} />
          </button>
          <Link href="/" className="flex-1">
            <span className="text-3xl font-extrabold tracking-tight text-[#255db1]">{navConfig.brand.logoText}</span>
            {navConfig.brand.tagline && <span className="block text-[11px] text-gray-500">{navConfig.brand.tagline}</span>}
          </Link>
          <div className="flex items-center gap-2">
            {navConfig.mobile.quickActions.slice(0,2).map(link => (
              <MobileQuickAction key={link.label} link={link} />
            ))}
          </div>
        </div>
        {navConfig.mobile.featuredTag && (
          <Link href={navConfig.mobile.featuredTag.href || '#'} className="mx-4 mb-3 inline-flex items-center gap-2 rounded-full bg-[#ffd400]/80 px-3 py-1 text-sm font-semibold text-black">
            <Icon name="flash" />
            {navConfig.mobile.featuredTag.label}
            {navConfig.mobile.featuredTag.badge && <span className="text-[11px] uppercase tracking-wide">{navConfig.mobile.featuredTag.badge}</span>}
          </Link>
        )}
        {mobileMenuOpen && (
          <MobileMenu
            navConfig={navConfig}
            closeMenu={() => setMobileMenuOpen(false)}
          />
        )}
      </div>

      {/* Yellow category bar (sticky) */}
      {showTicker && (
      <div className="hidden md:block">
        <div className={`bg-[#ffd400] border-t border-yellow-300 ${navConfig.sticky.enabled ? 'sticky z-40 shadow-sm' : ''}`} style={navConfig.sticky.enabled ? { top: navConfig.sticky.offsetPx ?? 0 } : undefined}>
          <div className="max-w-[var(--site-max)] mx-auto px-3">
            <div className="flex items-center gap-4 overflow-x-auto py-2 text-[15px] font-semibold text-black">
              <nav className="flex items-center gap-4">
                {navConfig.primaryLinks.map(link => (
                  <NavItem key={link.label} link={link} className="min-w-fit" />
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-3 text-sm font-medium">
                {navConfig.quickLinks.map(link => (
                  <NavItem key={link.label} link={link} className="text-[12px] uppercase tracking-widest" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 hidden md:block">
        <div className="max-w-[var(--site-max)] mx-auto px-4 py-2 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Follow</span>
          <div className="flex items-center gap-3">
            {navConfig.socialLinks.map(link => (
              <NavItem key={link.label} link={link} external />
            ))}
          </div>
        </div>
      </div>

      <MobileBottomNav links={navConfig.mobile.bottomNavLinks} />
    </header>
  )
}

function NavItem({ link, className = '', external }: { link: NavLink; className?: string; external?: boolean }) {
  const content = (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {link.icon && <Icon name={link.icon} />}
      {link.label}
      {link.badge && <span className="ml-1 rounded-full bg-black/10 px-1.5 text-[10px]">{link.badge}</span>}
    </span>
  )
  if (!link.href) return content
  if (link.external || external) return <a href={link.href} className="hover:underline" target="_blank" rel="noreferrer">{content}</a>
  return <Link href={link.href} className="hover:underline">{content}</Link>
}

function NavCTA({ cta }: { cta: NavCTAType }) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold'
  const styles = cta.variant === 'outline'
    ? 'border border-gray-300 text-gray-900 dark:text-white'
    : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
  return (
    <Link href={cta.href} className={`${base} ${styles}`}>
      {cta.label}
    </Link>
  )
}

function MobileQuickAction({ link }: { link: NavLink }) {
  if (!link.href) return null
  if (link.external) {
    return (
      <a href={link.href} className="p-2 rounded-full bg-gray-100 text-gray-700" target="_blank" rel="noreferrer">
        <Icon name={link.icon || 'flash'} />
      </a>
    )
  }
  return (
    <Link href={link.href} className="p-2 rounded-full bg-gray-100 text-gray-700">
      <Icon name={link.icon || 'flash'} />
    </Link>
  )
}

function MobileMenu({ navConfig, closeMenu }: { navConfig: TenantNavigationConfig; closeMenu: () => void }) {
  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/40 p-3 shadow-inner">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Top Sections</p>
        <div className="flex flex-wrap gap-2">
          {navConfig.mobile.primaryLinks.map(link => (
            <NavItem key={link.label} link={link} className="px-3 py-1.5 rounded-full bg-white text-sm font-semibold shadow-sm" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {navConfig.mobile.quickActions.map(link => (
          <NavItem key={link.label} link={link} className="w-full justify-center rounded-xl border border-gray-200 py-3 text-sm font-semibold" />
        ))}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Stay Connected</p>
        <div className="flex gap-3">
          {(navConfig.mobile.socialLinks || []).map(link => (
            <NavItem key={link.label} link={link} className="px-3 py-1.5 rounded-full bg-gray-100 text-sm" external />
          ))}
        </div>
      </div>
      <button type="button" onClick={closeMenu} className="w-full rounded-full bg-gray-900 py-3 text-white font-semibold">Close Menu</button>
    </div>
  )
}

function MobileBottomNav({ links }: { links: NavLink[] }) {
  if (!links?.length) return null
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[480px] items-center justify-around px-4 py-2 text-xs font-semibold text-gray-700">
        {links.map(link => (
          <NavItem key={link.label} link={link} className="flex flex-col items-center gap-1 text-[11px]" />
        ))}
      </div>
    </nav>
  )
}

function Icon({ name }: { name: string }) {
  switch (name) {
    case 'translate':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5h7m0 0v5m0-5L4 15"/><path d="M17 9l3 8h-6l3-8Z"/></svg>
    case 'download':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v10"/><path d="M8 11l4 4 4-4"/><path d="M5 19h14"/></svg>
    case 'location':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s6-5.686 6-10a6 6 0 1 0-12 0c0 4.314 6 10 6 10Z"/><circle cx="12" cy="11" r="2"/></svg>
    case 'youtube':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15l5.19-3L10 9v6Zm11.34-6.91a3 3 0 0 0-2.11-2.12C17.62 5.5 12 5.5 12 5.5s-5.62 0-7.23.47a3 3 0 0 0-2.11 2.12 32.63 32.63 0 0 0-.46 5.41 32.63 32.63 0 0 0 .46 5.41 3 3 0 0 0 2.11 2.11C6.38 21.44 12 21.44 12 21.44s5.62 0 7.23-.47a3 3 0 0 0 2.11-2.11 32.63 32.63 0 0 0 .46-5.41 32.63 32.63 0 0 0-.46-5.41Z"/></svg>
    case 'whatsapp':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.77 11.77 0 0 0 12 0a11.94 11.94 0 0 0-8.49 20.38L0 24l3.74-3.39A11.94 11.94 0 0 0 12 24a11.77 11.77 0 0 0 8.52-3.48A11.77 11.77 0 0 0 24 12a11.77 11.77 0 0 0-3.48-8.52ZM12 21.82a9.8 9.8 0 0 1-5-1.37l-.36-.21-2.23 2 2.08-2.39-.26-.33A9.84 9.84 0 1 1 21.84 12 9.85 9.85 0 0 1 12 21.82Zm5.08-7.34c-.28-.15-1.65-.81-1.91-.9s-.44-.14-.63.14-.72.9-.89 1.09-.33.21-.61.07a7.87 7.87 0 0 1-2.31-1.43 8.66 8.66 0 0 1-1.6-2c-.17-.3 0-.46.13-.61s.28-.33.42-.51a2.06 2.06 0 0 0 .28-.47.54.54 0 0 0 0-.51c0-.14-.63-1.52-.86-2.09s-.46-.49-.63-.5h-.54a1 1 0 0 0-.72.33 3 3 0 0 0-.94 2.21 5.22 5.22 0 0 0 1.09 2.74 11.92 11.92 0 0 0 4.55 4.12 15.18 15.18 0 0 0 1.52.56 3.64 3.64 0 0 0 1.67.11 2.73 2.73 0 0 0 1.78-1.26 2.24 2.24 0 0 0 .14-1.26c-.06-.11-.26-.19-.54-.34Z"/></svg>
    case 'twitter':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.5.38-2.22.94a4.31 4.31 0 0 0-7.32 3v.86a10.46 10.46 0 0 1-8.07-4.09s-3.36 7.54 4.21 11a11.94 11.94 0 0 1-7 2.12c7.57 4.36 16.71 0 16.71-9.94v-.46A5.42 5.42 0 0 0 22.46 6Z"/></svg>
    case 'play':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72L18 12 8 5.14Z"/></svg>
    case 'flash':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v13h3v7l7-14h-4l3-6H7Z"/></svg>
    case 'epaper':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h5M8 15h8"/></svg>
    case 'home':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11h14V9"/></svg>
    case 'grid':
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h6v6H4zM14 4h6v6h-6zM14 14h6v6h-6zM4 14h6v6H4z"/></svg>
    case 'menu':
      return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    case 'close':
      return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 6 12 12M6 18 18 6"/></svg>
    default:
      return null
  }
}

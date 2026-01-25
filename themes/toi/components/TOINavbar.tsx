import Link from 'next/link'
import type { UrlObject } from 'url'
import { getCategoriesForNav } from '@/lib/categories'
import { homeHref, categoryHref, basePathForTenant } from '@/lib/url'
import { getEffectiveSettings } from '@/lib/settings'
import { TOINavbarClient } from '@/themes/toi/components/TOINavbarClient'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

interface MenuItem {
  href: string
  label: string
  children?: { href: string; label: string }[]
}

export async function TOINavbar({
  tenantSlug,
  title,
  logoUrl,
}: {
  tenantSlug: string
  title: string
  logoUrl?: string
}) {
  const [cats, settings] = await Promise.all([getCategoriesForNav(), getEffectiveSettings()])

  const langRaw = String(settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'en')
  const primaryLang = (langRaw.toLowerCase() === 'telugu' ? 'te' : langRaw.toLowerCase().split('-')[0]) || 'en'

  // Safe category name extraction
  const extractCategoryName = (val: unknown): string => {
    if (!val) return ''
    if (typeof val === 'string') return val
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>
      if (obj.name && typeof obj.name === 'string') return obj.name
      if (obj.name && typeof obj.name === 'object') {
        const nested = obj.name as Record<string, unknown>
        if (nested.name && typeof nested.name === 'string') return nested.name
      }
      if (obj.slug && typeof obj.slug === 'string') return obj.slug
    }
    return String(val)
  }

  const categoryBySlug = new Map(cats.map((c) => [String(c.slug || ''), c]))
  const childrenByParentId = new Map<string, { href: string; label: string }[]>()
  for (const c of cats) {
    const parentId = c.parentId ? String(c.parentId) : ''
    if (!parentId) continue
    const list = childrenByParentId.get(parentId) || []
    list.push({ href: categoryHref(tenantSlug, c.slug), label: extractCategoryName(c.name) })
    childrenByParentId.set(parentId, list)
  }

  function pickMenuLabel(menuItem: {
    label?: string
    labels?: { base?: string; translated?: string }
    labelEn?: string
    labelNative?: string
  }): string {
    const isEnglish = primaryLang === 'en'
    if (!isEnglish) {
      const native = String(menuItem.labelNative || '').trim()
      if (native) return native
      const translated = String(menuItem.labels?.translated || '').trim()
      if (translated) return translated
    }
    const en = String(menuItem.labelEn || '').trim()
    if (en) return en
    const base = String(menuItem.labels?.base || '').trim()
    if (base) return base
    const label = String(menuItem.label || '').trim()
    if (label) return label
    return 'Untitled'
  }

  const basePath = basePathForTenant(tenantSlug)
  function normalizeHref(href: string) {
    const h = String(href || '')
    if (!h) return ''
    if (h.startsWith('http://') || h.startsWith('https://')) return h
    if (!h.startsWith('/')) return h
    if (h === '/') return homeHref(tenantSlug)
    if (!basePath) return h
    if (h === basePath || h.startsWith(`${basePath}/`)) return h
    return `${basePath}${h}`
  }

  const settingsMenu = settings?.navigation?.menu || settings?.settings?.navigation?.menu
  const items: MenuItem[] = Array.isArray(settingsMenu) && settingsMenu.length > 0
    ? settingsMenu
        .filter((m) => m && typeof m === 'object')
        .map((m) => {
          const catSlug = m.categorySlug ? String(m.categorySlug) : ''
          const category = catSlug ? categoryBySlug.get(catSlug) : undefined
          const href = catSlug ? categoryHref(tenantSlug, catSlug) : normalizeHref(String(m.href || ''))
          const catName = category ? extractCategoryName(category.name) : ''
          const label = (category && catName && primaryLang === 'en')
            ? (String(m.label || '').trim() ? String(m.label) : catName)
            : pickMenuLabel(m)
          const children = category ? childrenByParentId.get(String(category.id)) : undefined
          return { href, label, children }
        })
        .filter((x) => x.href && x.label)
    : (() => {
        const top = cats.filter((c) => !c.parentId)
        return ([{ href: homeHref(tenantSlug), label: 'Home', children: undefined }] as MenuItem[]).concat(
          top.slice(0, 10).map((c) => ({ href: categoryHref(tenantSlug, c.slug), label: extractCategoryName(c.name), children: childrenByParentId.get(String(c.id)) }))
        )
      })()

  const currentDate = new Date().toLocaleDateString(primaryLang === 'te' ? 'te-IN' : 'en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="toi-header">
      {/* Top Bar */}
      <div className="toi-header-top">
        <div className="toi-container flex items-center justify-between text-white text-xs py-1">
          <span>{currentDate}</span>
          <div className="flex items-center gap-4">
            <button className="hover:underline">English</button>
            <span>|</span>
            <button className="hover:underline">తెలుగు</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="toi-header-main">
        <Link href={toHref(homeHref(tenantSlug))} className="toi-logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={title} className="h-10 w-auto" />
          ) : (
            <span className="toi-logo-text">{title}</span>
          )}
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search news..."
              className="w-64 px-4 py-2 pr-10 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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

        {/* Mobile Menu Button (handled by client component) */}
        <TOINavbarClient items={items} />
      </div>

      {/* Navigation */}
      <nav className="toi-nav">
        <ul className="toi-nav-list">
          {items.map((item, idx) => (
            <li key={idx} className="toi-nav-item">
              <Link href={toHref(item.href)} className="toi-nav-link">
                {item.label}
                {item.children && item.children.length > 0 && (
                  <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
              {item.children && item.children.length > 0 && (
                <div className="toi-dropdown">
                  {item.children.map((child, childIdx) => (
                    <Link key={childIdx} href={toHref(child.href)} className="toi-dropdown-link">
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

import Link from 'next/link'
import type { UrlObject } from 'url'
import { getCategoriesForNav } from '@/lib/categories'
import { basePathForTenant, homeHref, categoryHref } from '@/lib/url'
import { getEffectiveSettings } from '@/lib/settings'
import NavbarMenuClient from './NavbarMenuClient'
import HeaderCollapseOnScrollClient from './HeaderCollapseOnScrollClient'

function toHref(pathname: string): UrlObject {
  return { pathname }
}

export async function Navbar({
  tenantSlug,
  title,
  logoUrl,
  variant = 'default',
}: {
  tenantSlug: string
  title: string
  logoUrl?: string
  variant?: 'default' | 'style2'
}) {
  const [cats, settings] = await Promise.all([getCategoriesForNav(), getEffectiveSettings()])

  const langRaw = String(settings?.content?.defaultLanguage || settings?.settings?.content?.defaultLanguage || 'en')
  const primaryLang = (langRaw.toLowerCase() === 'telugu' ? 'te' : langRaw.toLowerCase().split('-')[0]) || 'en'

  const categoryBySlug = new Map(cats.map((c) => [String(c.slug || ''), c]))
  const childrenByParentId = new Map<string, { href: string; label: string }[]>()
  for (const c of cats) {
    const parentId = c.parentId ? String(c.parentId) : ''
    if (!parentId) continue
    const list = childrenByParentId.get(parentId) || []
    list.push({ href: categoryHref(tenantSlug, c.slug), label: c.name })
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
  const items = Array.isArray(settingsMenu) && settingsMenu.length > 0
    ? settingsMenu
        .filter((m) => m && typeof m === 'object')
        .map((m) => {
          const categorySlug = m.categorySlug ? String(m.categorySlug) : ''
          const category = categorySlug ? categoryBySlug.get(categorySlug) : undefined
          const href = categorySlug ? categoryHref(tenantSlug, categorySlug) : normalizeHref(String(m.href || ''))
          const label = (category && category.name && primaryLang === 'en')
            ? (String(m.label || '').trim() ? String(m.label) : category.name)
            : pickMenuLabel(m)
          const children = category ? childrenByParentId.get(String(category.id)) : undefined
          return { href, label, children }
        })
        .filter((x) => x.href && x.label)
    : (() => {
        const top = cats.filter((c) => !c.parentId)
        return [{ href: homeHref(tenantSlug), label: 'Home' }].concat(
          top.slice(0, 10).map((c) => ({ href: categoryHref(tenantSlug, c.slug), label: c.name, children: childrenByParentId.get(String(c.id)) }))
        )
      })()

  if (variant === 'style2') {
    return (
      <header
        id="top"
        data-collapsed="false"
        className="group w-full border-b border-zinc-200 bg-white sticky top-0 z-50 transition-none"
        style={{ willChange: 'contents' }}
      >
        <HeaderCollapseOnScrollClient targetId="top" threshold={100} hysteresis={15} />

        <div className="mx-auto max-w-7xl px-4">
          {/* Masthead (center logo) - smooth hide/show */}
          <div 
            className="overflow-hidden transition-all duration-300 ease-out
              group-data-[collapsed=false]:max-h-24 group-data-[collapsed=false]:opacity-100 group-data-[collapsed=false]:py-4
              group-data-[collapsed=true]:max-h-0 group-data-[collapsed=true]:opacity-0 group-data-[collapsed=true]:py-0"
          >
            <Link href={toHref(homeHref(tenantSlug))} className="flex items-center justify-center gap-3">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={title} className="h-12 w-auto sm:h-14" />
              )}
              <div className="text-2xl font-medium tracking-tight text-black">{title}</div>
            </Link>
          </div>

          {/* Collapsed top bar (logo left) - smooth show/hide */}
          <div 
            className="flex items-center overflow-hidden transition-all duration-300 ease-out
              group-data-[collapsed=false]:max-h-0 group-data-[collapsed=false]:opacity-0
              group-data-[collapsed=true]:max-h-14 group-data-[collapsed=true]:opacity-100 group-data-[collapsed=true]:h-12"
          >
            <Link href={toHref(homeHref(tenantSlug))} className="flex items-center gap-2">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={title} className="h-8 w-auto" />
              )}
              <div className="text-lg font-medium text-black">{title}</div>
            </Link>
          </div>

          {/* Navigation row */}
          <nav className="hidden pb-2 sm:block" aria-label="Main navigation">
            <NavbarMenuClient items={items} />
          </nav>
        </div>

        {/* Accent strip using dynamic primary color */}
        <div className="h-0.5 w-full bg-[hsl(var(--primary,217_91%_60%))]" />
      </header>
    )
  }

  return (
    <header id="top" className="w-full border-b border-zinc-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top bar with logo and title */}
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link href={toHref(homeHref(tenantSlug))} className="flex items-center gap-3">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={title} className="h-10 w-auto sm:h-12" />
            )}
            <div className="text-xl sm:text-2xl font-medium text-zinc-900">{title}</div>
          </Link>
        </div>
        {/* Navigation row */}
        <div className="hidden pb-2 sm:block">
          <NavbarMenuClient items={items} />
        </div>
      </div>
      {/* Primary color accent strip */}
      <div className="h-1 w-full bg-[hsl(var(--primary,217_91%_60%))]" />
    </header>
  )
}
 

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
        className="group w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-40"
      >
        <HeaderCollapseOnScrollClient targetId="top" threshold={120} />

        <div className="mx-auto max-w-7xl px-4">
          {/* Masthead (center logo) - hides on scroll */}
          <div className="py-4 sm:py-6 group-data-[collapsed=true]:hidden">
            <Link href={toHref(homeHref(tenantSlug))} className="flex items-center justify-center">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={title} className="h-14 w-auto sm:h-16" />
              ) : (
                <div className="text-2xl font-extrabold tracking-tight">{title}</div>
              )}
            </Link>
          </div>

          {/* Collapsed top bar (logo left) - shows after scroll */}
          <div className="hidden h-12 items-center justify-start group-data-[collapsed=true]:flex">
            <Link href={toHref(homeHref(tenantSlug))} className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={title} className="h-8 w-auto sm:h-9" />
              ) : (
                <div className="text-base font-bold">{title}</div>
              )}
            </Link>
          </div>

          {/* Navigation row */}
          <div className="hidden pb-2 sm:block">
            <NavbarMenuClient items={items} />
          </div>
        </div>

        {/* Accent strip */}
        <div className="h-1 w-full" style={{ backgroundColor: 'hsl(var(--accent))' }} />
      </header>
    )
  }

  return (
    <header id="top" className="w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top bar: logo only (hide title text) */}
        <div className="flex h-12 items-center sm:h-14">
          <Link href={toHref(homeHref(tenantSlug))} className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={title} className="h-7 w-auto sm:h-8" />
            ) : null}
          </Link>
        </div>
        {/* Navigation below logo with More dropdown */}
        <div className="hidden pb-2 sm:block">
          <NavbarMenuClient items={items} />
        </div>
      </div>
      {/* Accent strip */}
      <div className="h-1 w-full" style={{ backgroundColor: 'hsl(var(--accent))' }} />
    </header>
  )
}
 

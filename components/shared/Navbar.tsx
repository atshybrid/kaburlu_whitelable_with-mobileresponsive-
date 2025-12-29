import Link from 'next/link'
import type { UrlObject } from 'url'
import { getCategoriesForNav } from '@/lib/categories'
import { homeHref, categoryHref } from '@/lib/url'
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
  const cats = await getCategoriesForNav()
  const top = cats.filter((c) => !c.parentId)
  const items = [{ href: homeHref(tenantSlug), label: 'Home' }].concat(
    top.slice(0, 10).map((c) => ({ href: categoryHref(tenantSlug, c.slug), label: c.name }))
  )

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
                <img src={logoUrl} alt={title} className="h-10 w-auto sm:h-12" />
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
                <img src={logoUrl} alt={title} className="h-7 w-auto sm:h-8" />
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
 

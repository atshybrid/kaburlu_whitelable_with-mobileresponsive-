import Link from 'next/link'
import { getCategoriesForNav } from '@/lib/categories'
import { homeHref, categoryHref } from '@/lib/url'
import NavbarMenuClient from './NavbarMenuClient'

export async function Navbar({ tenantSlug, title, logoUrl }: { tenantSlug: string; title: string; logoUrl?: string }) {
  const cats = await getCategoriesForNav()
  const top = cats.filter((c) => !c.parentId)
  const items = [{ href: homeHref(tenantSlug), label: 'Home' }].concat(
    top.slice(0, 10).map((c) => ({ href: categoryHref(tenantSlug, c.slug), label: c.name }))
  )
  return (
    <header id="top" className="w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top bar: logo only (hide title text) */}
        <div className="flex h-12 items-center sm:h-14">
          <Link href={homeHref(tenantSlug) as any} className="flex items-center gap-3">
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
 

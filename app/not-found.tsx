import Link from 'next/link'
import { resolveTenant } from '@/lib/tenant'
import { homeHref } from '@/lib/url'

export default async function NotFound() {
  const tenant = await resolveTenant().catch(() => ({ slug: 'demo' } as { slug: string }))
  const href = homeHref(tenant.slug)

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-extrabold">Page not found</h1>
      <p className="text-zinc-600">The page you’re looking for doesn’t exist or may have moved.</p>
      <div className="mt-6">
        <Link href={{ pathname: href }} className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          Go to Home
        </Link>
      </div>
    </main>
  )
}

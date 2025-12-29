'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Article } from '@/lib/data-sources'
import { articleHref } from '@/lib/url'

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr]
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export function TopStoriesTilesCarouselClient({ tenantSlug, items }: { tenantSlug: string; items: Article[] }) {
  const pages = useMemo(() => chunk(items, 3), [items])
  const [page, setPage] = useState(0)

  if (!items.length) return null

  const canPrev = page > 0
  const canNext = page < pages.length - 1

  return (
    <div className="relative overflow-hidden rounded-md border bg-white">
      <div className="flex w-full transition-transform duration-200 ease-out" style={{ transform: `translateX(-${page * 100}%)` }}>
        {pages.map((p, idx) => (
          <div key={idx} className="w-full shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
              {p.map((a) => (
                <div key={a.id} className="p-3">
                  <Link
                    href={{ pathname: articleHref(tenantSlug, a.slug || a.id) }}
                    className="block line-clamp-2 text-sm font-medium leading-snug hover:underline"
                  >
                    {a.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {pages.length > 1 ? (
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-2">
          <button
            type="button"
            className="pointer-events-auto rounded-md border bg-white px-2 py-1 text-sm disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded-md border bg-white px-2 py-1 text-sm disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={!canNext}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  )
}

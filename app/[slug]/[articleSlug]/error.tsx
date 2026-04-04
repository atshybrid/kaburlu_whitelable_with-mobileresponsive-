'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ArticleError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-zinc-200 p-8 text-center">
        <div className="text-4xl mb-4">📰</div>
        <h1 className="text-xl font-bold text-zinc-800 mb-2">వార్త లోడ్ కాలేదు</h1>
        <p className="text-sm text-zinc-500 mb-6">
          ఈ వార్తను తెరవడంలో సమస్య వచ్చింది. దయచేసి మళ్ళీ ప్రయత్నించండి.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            మళ్ళీ ప్రయత్నించు
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            హోమ్ పేజీకి వెళ్ళు
          </Link>
        </div>
      </div>
    </div>
  )
}

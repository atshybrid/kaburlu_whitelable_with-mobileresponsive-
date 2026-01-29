'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlaceholderImg } from './PlaceholderImg'
import { articleHref as buildArticleHref } from '@/lib/url'

type TopArticle = {
  id: string
  slug: string
  title: string
  viewCount: number
  publishedAt: string
  category?: {
    slug: string
    name: string
  }
  coverImageUrl?: string
  coverImage?: { url?: string }
  image?: string
}

export function TopArticlesModal({
  articles,
  tenantSlug,
}: {
  articles: TopArticle[]
  tenantSlug: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Show modal after 3 seconds, only once per session
    if (!hasShown && articles.length > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasShown(true)
        // Store in sessionStorage to prevent showing again
        sessionStorage.setItem('topArticlesModalShown', 'true')
      }, 3000)

      // Check if already shown in this session
      if (sessionStorage.getItem('topArticlesModalShown')) {
        clearTimeout(timer)
      }

      return () => clearTimeout(timer)
    }
  }, [hasShown, articles.length])

  if (!isOpen || articles.length === 0) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header - Mobile Optimized */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-500 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">🔥</span>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white">నేడు అత్యధికంగా చదివిన వార్తలు</h2>
              <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Today&apos;s Most Viewed Articles</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
            aria-label="Close"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Mobile Optimized */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[calc(85vh-80px)] p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {articles.slice(0, 5).map((article, idx) => {
              // ✅ Check multiple image fields from API
              const imageUrl = article.coverImageUrl || article.coverImage?.url || article.image || null
              return (
                <Link
                  key={article.id}
                  href={buildArticleHref(tenantSlug, article.slug)}
                  onClick={() => setIsOpen(false)}
                  className="group flex gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-zinc-200 hover:border-orange-500 hover:shadow-lg transition-all duration-200 bg-white"
                >
                  {/* Rank Badge - Smaller on mobile */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Image - Responsive size */}
                  <div className="w-20 h-14 sm:w-32 sm:h-20 flex-shrink-0 overflow-hidden rounded-md sm:rounded-lg bg-zinc-100">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <PlaceholderImg className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Content - Mobile optimized text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-black line-clamp-2 group-hover:text-orange-600 transition-colors mb-1 sm:mb-2" style={{ lineHeight: '1.4' }}>
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-500">
                      {article.category ? (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-50 text-orange-600 rounded-full font-medium text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-none">
                          {article.category.name}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[10px] sm:text-xs">{article.viewCount.toLocaleString('te-IN')}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer - Mobile Optimized */}
        <div className="sticky bottom-0 bg-zinc-50 px-3 sm:px-6 py-2 sm:py-3 border-t border-zinc-200">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all text-sm sm:text-base"
          >
            మూసివేయండి
          </button>
        </div>
      </div>
    </div>
  )
}

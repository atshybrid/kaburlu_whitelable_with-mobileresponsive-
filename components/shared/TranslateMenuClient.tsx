'use client'

import type { ChangeEvent } from 'react'

const LANGUAGE_OPTIONS: Array<{ code: string; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
]

const TRANSLATE_TRACKING_PARAMS = [
  '_x_tr_sl',
  '_x_tr_tl',
  '_x_tr_hl',
  '_x_tr_pto',
  '_x_tr_hist',
  '_x_tr_sch',
  '_x_tr_enc',
  '_x_tr_url',
]

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function cleanTranslateParams(url: URL) {
  for (const param of TRANSLATE_TRACKING_PARAMS) {
    url.searchParams.delete(param)
  }
  return url
}

function getPreferredPageUrl(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return ''

  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')
  const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content')
  const candidate = (canonical || ogUrl || window.location.href || '').trim()

  if (!candidate) return window.location.href

  try {
    return new URL(candidate, window.location.origin).toString()
  } catch {
    return window.location.href
  }
}

function unwrapTranslatedUrl(rawUrl: string): string {
  let current = rawUrl

  for (let i = 0; i < 4; i++) {
    let parsed: URL
    try {
      parsed = new URL(current)
    } catch {
      return current
    }

    const host = parsed.hostname.toLowerCase()

    // Wrapper URL: https://translate.google.com/translate?...&u=<original-url>
    if (host.includes('translate.google')) {
      const nested = parsed.searchParams.get('u')
      if (nested) {
        current = safeDecode(nested)
        continue
      }
      return cleanTranslateParams(parsed).toString()
    }

    // Proxy URL: https://example-com.translate.goog/path?..._x_tr_*
    if (host.endsWith('.translate.goog')) {
      const nested = parsed.searchParams.get('_x_tr_url') || parsed.searchParams.get('u')
      if (nested) {
        current = safeDecode(nested)
        continue
      }
      return cleanTranslateParams(parsed).toString()
    }

    return cleanTranslateParams(parsed).toString()
  }

  return current
}

export default function TranslateMenuClient({ compact = false }: { compact?: boolean }) {
  const handleTranslate = (event: ChangeEvent<HTMLSelectElement>) => {
    const targetLanguage = event.target.value
    if (!targetLanguage || typeof window === 'undefined') return

    const preferredUrl = getPreferredPageUrl()
    const sourceUrl = unwrapTranslatedUrl(preferredUrl)
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(targetLanguage)}&u=${encodeURIComponent(sourceUrl)}`
    event.target.value = ''
    window.location.href = translateUrl
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-zinc-700 shadow-sm">
      <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 5.5A18.022 18.022 0 0015.588 9m-3.04 5.5l2.952 6.5m0 0l2.952-6.5m-2.952 6.5H12" />
      </svg>
      <select
        defaultValue=""
        onChange={handleTranslate}
        className={`bg-transparent text-zinc-700 focus:outline-none ${compact ? 'text-[11px]' : 'text-xs'}`}
        aria-label="Translate this news page"
      >
        <option value="">Translate</option>
        {LANGUAGE_OPTIONS.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  )
}

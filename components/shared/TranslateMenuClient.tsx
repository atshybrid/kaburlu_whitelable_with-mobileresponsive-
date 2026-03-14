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

export default function TranslateMenuClient({ compact = false }: { compact?: boolean }) {
  const handleTranslate = (event: ChangeEvent<HTMLSelectElement>) => {
    const targetLanguage = event.target.value
    if (!targetLanguage || typeof window === 'undefined') return

    const currentUrl = window.location.href
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(targetLanguage)}&u=${encodeURIComponent(currentUrl)}`
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

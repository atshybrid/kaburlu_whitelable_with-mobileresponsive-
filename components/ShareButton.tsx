"use client"
import { useState } from 'react'

type Props = {
  title: string
  slug: string
  image?: string
  text?: string
  className?: string
}

function getAbsoluteUrl(path: string) {
  if (typeof window !== 'undefined' && window.location) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    return origin.replace(/\/$/, '') + path
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL || ''
  return origin.replace(/\/$/, '') + path
}

export default function ShareButton({ title, slug, image, text, className }: Props) {
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)

  async function onShare() {
    setBusy(true); setOk(false)
    const url = getAbsoluteUrl(`/article/${slug}`)
    try {
      const canFiles = typeof navigator !== 'undefined' && 'canShare' in navigator
      let files: File[] | undefined = undefined
      if (image && canFiles) {
        try {
          const res = await fetch(image)
          const blob = await res.blob()
          const file = new File([blob], 'cover.jpg', { type: blob.type || 'image/jpeg' })
          // @ts-ignore
          if (!navigator.canShare || navigator.canShare({ files: [file] })) {
            files = [file]
          }
        } catch {}
      }
      // @ts-ignore
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ title, text: text || title, url, files })
        setOk(true)
      } else {
        throw new Error('Web Share not available')
      }
    } catch (e) {
      try {
        await navigator.clipboard?.writeText(url)
        setOk(true)
      } catch {}
    } finally {
      setBusy(false)
      setTimeout(()=> setOk(false), 2000)
    }
  }

  return (
    <button
      onClick={onShare}
      disabled={busy}
      aria-label="Share"
      className={className || 'px-3 py-1.5 text-sm rounded bg-white/90 text-gray-900 border border-gray-200'}
    >
      {ok ? 'Copied!' : (busy ? 'Sharing…' : 'Share')}
    </button>
  )
}

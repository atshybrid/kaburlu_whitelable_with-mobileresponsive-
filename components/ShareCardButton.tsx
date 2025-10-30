"use client"
import { useState } from 'react'
import * as htmlToImage from 'html-to-image'

type Props = {
  getNode: () => HTMLElement | null
  title: string
  url: string
  className?: string
}

export default function ShareCardButton({ getNode, title, url, className }: Props) {
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)

  async function onShare() {
    setBusy(true); setOk(false)
    try {
      const node = getNode()
      if (!node) throw new Error('No node to capture')

      // Use a fixed pixel ratio for crispness on mobile
      const pixelRatio = Math.min(window.devicePixelRatio || 2, 2)
      const trustedHosts = new Set([
        typeof window !== 'undefined' ? window.location.host : '',
        'images.unsplash.com',
        'picsum.photos',
      ])

      // Filter out images from untrusted hosts (to avoid canvas tainting) like pravatar
      const filter = (n: HTMLElement) => {
        if (n instanceof HTMLImageElement) {
          try {
            const u = new URL(n.currentSrc || n.src)
            if (!trustedHosts.has(u.host)) return false
          } catch {}
        }
        return true
      }

      const dataUrl = await htmlToImage.toJpeg(node, {
        pixelRatio,
        cacheBust: true,
        backgroundColor: '#ffffff',
        quality: 0.95,
        filter: filter as any,
      })
      if (!dataUrl) throw new Error('Failed to render image')
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'news-card.jpg', { type: 'image/jpeg' })

      // Prefer native share with file
      // @ts-ignore
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        // @ts-ignore
        await navigator.share({ title, text: title, url, files: [file] })
        setOk(true)
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard?.writeText(url)
        setOk(true)
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
      className={className || 'px-3 py-1.5 text-sm rounded bg-white text-gray-900 border border-gray-200'}
      aria-label="Share as image"
    >
      {ok ? 'Shared!' : (busy ? 'Creating…' : 'Share card')}
    </button>
  )
}

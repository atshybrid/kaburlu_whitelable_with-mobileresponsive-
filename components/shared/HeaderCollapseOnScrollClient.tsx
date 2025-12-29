'use client'

import { useEffect } from 'react'

export default function HeaderCollapseOnScrollClient({
  targetId,
  threshold = 120,
}: {
  targetId: string
  threshold?: number
}) {
  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return

    let ticking = false

    const update = () => {
      const collapsed = window.scrollY > threshold
      const next = collapsed ? 'true' : 'false'
      if (el.getAttribute('data-collapsed') !== next) el.setAttribute('data-collapsed', next)
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [targetId, threshold])

  return null
}

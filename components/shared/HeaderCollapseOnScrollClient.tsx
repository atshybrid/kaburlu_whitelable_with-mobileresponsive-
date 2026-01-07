'use client'

import { useEffect, useRef } from 'react'

export default function HeaderCollapseOnScrollClient({
  targetId,
  threshold = 120,
  hysteresis = 20,
}: {
  targetId: string
  threshold?: number
  hysteresis?: number
}) {
  const lastCollapsedRef = useRef<boolean | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return

    const update = () => {
      const scrollY = window.scrollY
      const wasCollapsed = lastCollapsedRef.current
      
      // Use hysteresis to prevent flickering at threshold boundary
      let shouldCollapse: boolean
      if (wasCollapsed === null) {
        // Initial state
        shouldCollapse = scrollY > threshold
      } else if (wasCollapsed) {
        // Currently collapsed - only uncollapse if scrolled well above threshold
        shouldCollapse = scrollY > (threshold - hysteresis)
      } else {
        // Currently expanded - only collapse if scrolled well below threshold
        shouldCollapse = scrollY > (threshold + hysteresis)
      }

      if (lastCollapsedRef.current !== shouldCollapse) {
        lastCollapsedRef.current = shouldCollapse
        el.setAttribute('data-collapsed', shouldCollapse ? 'true' : 'false')
      }
      
      rafRef.current = null
    }

    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(update)
    }

    // Initial update
    update()
    
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [targetId, threshold, hysteresis])

  return null
}

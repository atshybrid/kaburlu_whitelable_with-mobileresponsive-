"use client"
import { useState, useEffect } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollableHeight = documentHeight - windowHeight
      
      if (scrollableHeight > 0) {
        const scrollPercentage = (scrollTop / scrollableHeight) * 100
        setProgress(Math.min(100, Math.max(0, scrollPercentage)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="reading-progress-track pointer-events-none fixed top-0 left-0 right-0 z-30 h-[3px]"
      aria-hidden="true"
    >
      <div
        className="reading-progress-fill h-full bg-gradient-to-r from-red-600 via-red-500 to-pink-600 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

"use client"
import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement
      const body = document.body
      const scrollTop = doc.scrollTop || body.scrollTop
      const scrollHeight = doc.scrollHeight || body.scrollHeight
      const clientHeight = doc.clientHeight
      const total = Math.max(1, scrollHeight - clientHeight)
      setProgress(Math.min(100, Math.max(0, (scrollTop / total) * 100)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gray-200/70">
      <div className="h-full bg-indigo-600 transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  )
}

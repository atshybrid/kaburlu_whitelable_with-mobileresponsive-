"use client"
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextDark = saved ? saved === 'dark' : prefers
    setDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
  }, [])

  if (!mounted) return null

  return (
    <button
      aria-label="Toggle theme"
      className="text-sm px-2 py-1 rounded border border-gray-200 bg-white/80 dark:bg-gray-800 dark:border-gray-700"
      onClick={() => {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
      }}
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}

"use client"
import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PWA === 'true' && 'serviceWorker' in navigator) {
      const swUrl = '/sw.js'
      navigator.serviceWorker.register(swUrl).catch(err => {
        console.error('[PWA] SW registration failed', err)
      })
    }
  }, [])
  return null
}

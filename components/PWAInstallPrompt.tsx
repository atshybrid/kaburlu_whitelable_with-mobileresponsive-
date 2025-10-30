"use client"
import { useEffect, useState } from 'react'

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    function onBeforeInstallPrompt(e: any) {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  if (!show || !deferred) return null
  return (
    <div className="fixed bottom-20 left-0 right-0 px-3 md:hidden">
      <div className="max-w-[var(--site-max)] mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-center justify-between">
        <div className="text-sm">
          <div className="font-semibold">Install DailyBrief</div>
          <div className="text-gray-600">Get quick access from your home screen</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm" onClick={()=> setShow(false)}>Not now</button>
          <button
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded"
            onClick={async ()=> { await deferred.prompt(); const _ = await deferred.userChoice; setDeferred(null); setShow(false); }}
          >Install</button>
        </div>
      </div>
    </div>
  )
}

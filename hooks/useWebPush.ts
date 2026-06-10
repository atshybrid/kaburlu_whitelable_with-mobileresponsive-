'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getServiceWorkerReg,
  syncSubscriptionToBackend,
  urlBase64ToUint8Array,
} from '@/lib/push-utils'

export interface UseWebPushOptions {
  vapidPublicKey?: string | null
  fcmSenderId?: string | null
  enabled?: boolean
}

export function useWebPush({
  vapidPublicKey,
  fcmSenderId,
  enabled = true,
}: UseWebPushOptions) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return
    setIsSupported(true)
    setPermission(Notification.permission)
  }, [])

  const refreshSubscription = useCallback(async () => {
    if (!enabled || !isSupported || !vapidPublicKey) {
      setIsSubscribed(false)
      return
    }
    try {
      const reg = await getServiceWorkerReg()
      if (!reg) {
        setIsSubscribed(false)
        return
      }
      const existing = await reg.pushManager.getSubscription()
      setIsSubscribed(existing !== null)
      if (existing) void syncSubscriptionToBackend(existing, fcmSenderId ?? null).catch(() => {})
    } catch {
      setIsSubscribed(false)
    }
  }, [enabled, fcmSenderId, isSupported, vapidPublicKey])

  useEffect(() => {
    if (!enabled || !isSupported || !vapidPublicKey) {
      setIsSubscribed(false)
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then(() => refreshSubscription())
      .catch((err) => {
        console.error('❌ SW registration failed:', err)
        setIsSubscribed(false)
      })
  }, [enabled, isSupported, vapidPublicKey, refreshSubscription])

  useEffect(() => {
    const onChange = () => void refreshSubscription()
    window.addEventListener('push-subscription-changed', onChange)
    return () => window.removeEventListener('push-subscription-changed', onChange)
  }, [refreshSubscription])

  const handleSubscribe = useCallback(async () => {
    if (!enabled || !vapidPublicKey || isBusy) return false
    try {
      setIsBusy(true)
      const currentPermission = await Notification.requestPermission()
      setPermission(currentPermission)
      if (currentPermission !== 'granted') return false

      const reg = await getServiceWorkerReg()
      if (!reg) return false

      const existing = await reg.pushManager.getSubscription()
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        }))

      await syncSubscriptionToBackend(sub, fcmSenderId ?? null)
      setIsSubscribed(true)
      window.dispatchEvent(new CustomEvent('push-subscription-changed'))
      return true
    } catch (err) {
      console.error('❌ Subscribe error:', err)
      return false
    } finally {
      setIsBusy(false)
    }
  }, [enabled, fcmSenderId, isBusy, vapidPublicKey])

  const handleUnsubscribe = useCallback(async () => {
    if (isBusy) return false
    try {
      setIsBusy(true)
      const reg = await getServiceWorkerReg()
      if (!reg) return false
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setIsSubscribed(false)
      window.dispatchEvent(new CustomEvent('push-subscription-changed'))
      return true
    } catch (err) {
      console.error('❌ Unsubscribe error:', err)
      return false
    } finally {
      setIsBusy(false)
    }
  }, [isBusy])

  return {
    permission,
    isSupported,
    isSubscribed,
    isBusy,
    handleSubscribe,
    handleUnsubscribe,
  }
}

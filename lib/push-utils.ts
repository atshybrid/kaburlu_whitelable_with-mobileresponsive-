export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export async function getServiceWorkerReg() {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.ready
}

export async function syncSubscriptionToBackend(
  sub: PushSubscription,
  fcmSenderId: string | null,
): Promise<void> {
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub, fcmSenderId }),
  })
  if (!response.ok) throw new Error(`API ${response.status}`)
}

export function isPushDismissed(key = 'push_prompt_dismissed_at', days = 7): boolean {
  try {
    const ts = localStorage.getItem(key)
    if (!ts) return false
    return Date.now() - Number(ts) < days * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function savePushDismiss(key = 'push_prompt_dismissed_at') {
  try {
    localStorage.setItem(key, String(Date.now()))
  } catch {
    /* ignore */
  }
}

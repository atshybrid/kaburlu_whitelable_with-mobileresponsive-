import { headers } from 'next/headers'
import { getDomainSettings } from '../../../lib/tenantApi'

export const dynamic = 'force-dynamic'

function Pre({data}:{data:any}){
  return <pre className="text-xs whitespace-pre-wrap break-all bg-gray-950/90 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[60vh]">{JSON.stringify(data, null, 2)}</pre>
}

export default async function DomainSettingsDebugPage(){
  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'UNKNOWN_HOST'
  let settings: any = null
  let error: string | null = null
  const startedAt = Date.now()
  try {
    settings = await getDomainSettings({ cache: 'no-store', previewTenantDomain: host, timeoutMs: 4000 })
  } catch (e: any) {
    error = e?.message || String(e)
  }
  const finishedAt = Date.now()
  return (
    <main className="py-6 space-y-6 max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold">Domain Settings Debug</h1>
      <p className="text-sm text-gray-600">Host detected: <code className="font-mono">{host}</code>. Duration: {(finishedAt-startedAt)}ms</p>
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Raw Settings Response</h2>
        <Pre data={settings} />
      </section>
      <ClientRefetch host={host} />
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Curl Examples</h2>
        <Pre data={{
          directBackend: `curl -H 'accept: application/json' -H 'X-Tenant-Domain: ${host}' https://app.kaburlumedia.com/api/v1/public/domain/settings`,
          viaRewrite: `curl -H 'accept: application/json' -H 'Host: ${host}' https://${host}/api/public/domain/settings`,
          note: 'Rewrite /api/* -> BACKEND_ORIGIN. The Host header ensures multi-tenant match.'
        }} />
      </section>
    </main>
  )
}

'use client'
import { useState } from 'react'

function ClientRefetch({ host }: { host: string }) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const refetch = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/public/domain/settings', { headers: { 'X-Tenant-Domain': host } })
      if(!res.ok) throw new Error(`Status ${res.status}`)
      const json = await res.json()
      setResult(json)
    } catch(e:any) {
      setError(e.message)
    } finally { setLoading(false) }
  }
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Client Re-Fetch</h2>
      <button onClick={refetch} disabled={loading} className="px-4 py-2 rounded bg-gray-900 text-white text-sm font-semibold disabled:opacity-50">{loading? 'Loading…':'Refetch Settings (client)'} </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && <Pre data={result} />}
    </section>
  )
}

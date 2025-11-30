'use client'
import { useState } from 'react'

function Pre({data}:{data:any}){
  return <pre className="text-xs whitespace-pre-wrap break-all bg-gray-950/90 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[60vh]">{JSON.stringify(data, null, 2)}</pre>
}

export default function ClientRefetch({ tenantDomain }: { tenantDomain: string }) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const refetch = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/public/domain/settings', { headers: { 'X-Tenant-Domain': tenantDomain } })
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

import { headers } from 'next/headers'
import { getDomainSettings } from '../../../lib/tenantApi'

export const dynamic = 'force-dynamic'

function Pre({data}:{data:any}){
  return <pre className="text-xs whitespace-pre-wrap break-all bg-gray-950/90 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[60vh]">{JSON.stringify(data, null, 2)}</pre>
}

export default async function DomainSettingsDebugPage(){
  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || 'UNKNOWN_HOST'
  const overrideTenant = hdrs.get('x-tenant-domain') || hdrs.get('tenant-domain') || null
  const effectiveTenantDomain = (overrideTenant || host)
  const normalizedTenantDomain = effectiveTenantDomain.replace(/:\d+$/, '')
  let settings: any = null
  let error: string | null = null
  const startedAt = Date.now()
  const authHeader = process.env.TENANT_SETTINGS_AUTH_TOKEN ? { Authorization: `Bearer ${process.env.TENANT_SETTINGS_AUTH_TOKEN}` } : undefined
  try {
    settings = await getDomainSettings({ cache: 'no-store', previewTenantDomain: normalizedTenantDomain, timeoutMs: 4000, headers: authHeader })
  } catch (e: any) {
    error = e?.message || String(e)
  }
  const finishedAt = Date.now()
  return (
    <main className="py-6 space-y-6 max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold">Domain Settings Debug</h1>
      <p className="text-sm text-gray-600">Host detected: <code className="font-mono">{host}</code>{overrideTenant && <> | Override header: <code className="font-mono">{overrideTenant}</code></>} | Effective: <code className="font-mono">{effectiveTenantDomain}</code> | Normalized: <code className="font-mono">{normalizedTenantDomain}</code>. Duration: {(finishedAt-startedAt)}ms</p>
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Raw Settings Response</h2>
        <Pre data={settings} />
      </section>
      <ClientRefetch tenantDomain={normalizedTenantDomain} />
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Curl Examples</h2>
        <Pre data={{
          directBackend: `curl -H 'accept: application/json' -H 'X-Tenant-Domain: kaburlu.sathuva.in' https://app.kaburlumedia.com/api/v1/public/domain/settings`,
          viaLocalRewrite: `curl -H 'accept: application/json' -H 'X-Tenant-Domain: kaburlu.sathuva.in' http://localhost:3000/api/public/domain/settings`,
          viaLocalPage: `curl -H 'X-Tenant-Domain: kaburlu.sathuva.in' http://localhost:3000/debug/domain-settings`,
          altHeader: `curl -H 'Tenant-Domain: kaburlu.sathuva.in' http://localhost:3000/debug/domain-settings`,
          withAuthEnv: process.env.TENANT_SETTINGS_AUTH_TOKEN ? 'Auth header injected from TENANT_SETTINGS_AUTH_TOKEN env.' : 'Set TENANT_SETTINGS_AUTH_TOKEN in .env.local to include Authorization header',
          note: 'X-Tenant-Domain preferred. Tenant-Domain (without X-) accepted for convenience.'
        }} />
      </section>
    </main>
  )
}

import ClientRefetch from './ClientRefetch'

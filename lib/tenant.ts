import { headers } from 'next/headers'
import { prisma } from './db'

export type Tenant = {
  id: string
  slug: string
  name: string
  themeKey: string
  domain?: string | null
}

export async function getTenantFromHeaders() {
  const h = await headers()
  const mode = process.env.MULTITENANT_MODE || 'path'
  const defaultTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'demo'

  let slug = defaultTenant

  const host = h.get('host') || ''
  const pathname = h.get('x-pathname') || ''

  if (mode === 'subdomain' && host && !host.startsWith('localhost')) {
    const parts = host.split('.')
    if (parts.length > 2) slug = parts[0]
  }

  if (mode === 'path' && pathname.startsWith('/t/')) {
    const seg = pathname.split('/')
    if (seg[2]) slug = seg[2]
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  return tenant ?? { id: 'na', slug, name: slug, themeKey: 'style1', domain: null }
}

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
  const dataSource = process.env.DATA_SOURCE || 'remote'

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

  // If we're using the remote backend (or DATABASE_URL isn't configured on the host),
  // don't touch Prisma at runtime. This prevents Vercel runtime crashes when env vars
  // like DATABASE_URL are not set.
  if (dataSource !== 'local' || !process.env.DATABASE_URL) {
    return { id: 'na', slug, name: slug, themeKey: 'style1', domain: null }
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  return tenant ?? { id: 'na', slug, name: slug, themeKey: 'style1', domain: null }
}

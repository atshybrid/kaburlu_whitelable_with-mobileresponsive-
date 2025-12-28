import { NextRequest } from 'next/server'
import { prisma } from './db'

export async function resolveTenant(req: NextRequest) {
  const defaultTenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'demo'
  const mode = process.env.MULTITENANT_MODE || 'path'

  let slug = req.headers.get('x-tenant') || defaultTenant

  if (mode === 'path') {
    const url = new URL(req.url)
    const seg = url.pathname.split('/')
    const idx = seg.indexOf('t')
    if (idx !== -1 && seg[idx + 1]) slug = seg[idx + 1]
  }

  return prisma.tenant.findUnique({ where: { slug } })
}

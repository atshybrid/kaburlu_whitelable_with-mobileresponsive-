import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { resolveTenant } from '@/lib/api-tenant'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const tenant = await resolveTenant(req)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  const items = await prisma.category.findMany({ where: { tenantId: tenant.id }, orderBy: { name: 'asc' } })
  return NextResponse.json(items)
}

const Body = z.object({ slug: z.string(), name: z.string() })
export async function POST(req: NextRequest) {
  const tenant = await resolveTenant(req)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  const json = await req.json().catch(() => null)
  const body = Body.safeParse(json)
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  const created = await prisma.category.create({ data: { ...body.data, tenantId: tenant.id } })
  return NextResponse.json(created, { status: 201 })
}

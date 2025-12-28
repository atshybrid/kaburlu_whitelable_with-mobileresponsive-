import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  const items = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

const Body = z.object({ slug: z.string().min(2), name: z.string().min(2), themeKey: z.enum(['style1', 'style2', 'style3']).default('style1'), domain: z.string().optional() })

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const body = Body.safeParse(json)
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  const created = await prisma.tenant.create({ data: body.data })
  return NextResponse.json(created, { status: 201 })
}

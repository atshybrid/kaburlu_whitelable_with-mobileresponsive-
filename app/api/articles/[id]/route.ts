import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const item = await prisma.article.findUnique({ where: { id }, include: { coverImage: true } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

const Body = z.object({ title: z.string().optional(), excerpt: z.string().optional(), content: z.string().optional() })

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const json = await req.json().catch(() => null)
  const body = Body.safeParse(json)
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  const updated = await prisma.article.update({ where: { id }, data: body.data })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  await prisma.article.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

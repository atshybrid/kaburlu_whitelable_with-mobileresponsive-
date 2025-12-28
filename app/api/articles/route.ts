import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { resolveTenant } from '@/lib/api-tenant'

const ArticleBody = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  categorySlugs: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const tenant = await resolveTenant(req)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  const items = await prisma.article.findMany({
    where: { tenantId: tenant.id },
    orderBy: { publishedAt: 'desc' },
    include: { coverImage: true },
    take: 50,
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const tenant = await resolveTenant(req)
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  const json = await req.json().catch(() => null)
  const body = ArticleBody.safeParse(json)
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const data = body.data
  const article = await prisma.article.create({
    data: {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      tenantId: tenant.id,
    },
  })
  if (data.categorySlugs?.length) {
    const cats = await prisma.category.findMany({ where: { tenantId: tenant.id, slug: { in: data.categorySlugs } } })
    await prisma.articleCategory.createMany({ data: cats.map((c: { id: string }) => ({ articleId: article.id, categoryId: c.id })) })
  }
  return NextResponse.json(article, { status: 201 })
}

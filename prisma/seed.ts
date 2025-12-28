import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenants = [
    { slug: 'demo', name: 'Kaburlu Demo', themeKey: 'style1' },
    { slug: 'andhra', name: 'Andhra News', themeKey: 'style2' },
    { slug: 'telangana', name: 'Telangana News', themeKey: 'style3' },
  ]

  for (const t of tenants) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: t.slug },
      update: { name: t.name, themeKey: t.themeKey },
      create: { slug: t.slug, name: t.name, themeKey: t.themeKey },
    })

    const categories = await Promise.all(
      ['Breaking News', 'Politics', 'Sports', 'Business', 'Entertainment'].map((name) =>
        prisma.category.upsert({
          where: { tenantId_slug: { tenantId: tenant.id, slug: name.toLowerCase().replace(/\s+/g, '-') } },
          update: {},
          create: { name, slug: name.toLowerCase().replace(/\s+/g, '-'), tenantId: tenant.id },
        })
      )
    )

    const author = await prisma.author.upsert({
      where: { id: `${tenant.id}-author` },
      update: {},
      create: { id: `${tenant.id}-author`, name: 'Staff Reporter', tenantId: tenant.id },
    })

    for (let i = 1; i <= 8; i++) {
      const slug = `sample-article-${i}`
      const cover = await prisma.media.create({
        data: {
          url: `https://picsum.photos/seed/${tenant.slug}-${i}/800/450`,
          width: 800,
          height: 450,
          type: 'image/jpeg',
          tenantId: tenant.id,
        },
      })

      const art = await prisma.article.upsert({
        where: { tenantId_slug: { tenantId: tenant.id, slug } },
        update: {},
        create: {
          slug,
          title: `Sample Headline ${i} for ${tenant.name}`,
          excerpt: 'This is a seeded article used for initial demo.',
          content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel.</p>',
          status: 'PUBLISHED',
          publishedAt: new Date(),
          tenantId: tenant.id,
          authorId: author.id,
          coverImageId: cover.id,
        },
      })

      // link to a couple of categories
      await prisma.articleCategory.upsert({
        where: { articleId_categoryId: { articleId: art.id, categoryId: categories[0].id } },
        update: {},
        create: { articleId: art.id, categoryId: categories[0].id },
      })
      await prisma.articleCategory.upsert({
        where: { articleId_categoryId: { articleId: art.id, categoryId: categories[(i % categories.length)].id } },
        update: {},
        create: { articleId: art.id, categoryId: categories[(i % categories.length)].id },
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

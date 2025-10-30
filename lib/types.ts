export type Category = {
  slug: string
  name: string
}

export type Reporter = {
  slug: string
  name: string
  avatar?: string
  bio?: string
}

export type Article = {
  id: string
  slug: string
  title: string
  summary: string
  bodyHtml: string
  hero?: string
  thumb?: string
  publishedAt: string
  readTime: number
  category: Category
  reporter: Reporter
  views?: number
  trendingScore?: number
}

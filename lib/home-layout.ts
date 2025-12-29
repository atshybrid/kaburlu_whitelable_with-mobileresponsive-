import { z } from 'zod'
import path from 'path'
import { promises as fs } from 'fs'

const DATA_DIR = path.join(process.cwd(), '.data', 'home-layout')

export type HomeLayoutThemeKey = 'style1' | 'style2' | 'style3' | 'tv9'

export type HomeLayout = {
  version: number
  tenantSlug: string
  themeKey: HomeLayoutThemeKey
  updatedAt: string
  sections: HomeSection[]
}

export type HomeSectionLayout =
  | { type: 'full' }
  | {
      type: 'grid'
      columns: Array<{ key: string; name: string; position: number }>
    }

export type HomeSection = {
  id: string
  key: string
  name: string
  position: number
  isActive: boolean
  layout: HomeSectionLayout
  blocks: HomeBlock[]
}

export type HomeBlockType =
  | 'flashTicker'
  | 'heroLead'
  | 'mediumCards'
  | 'smallList'
  | 'categoryBlock'
  | 'trendingCategoryBlock'
  | 'trendingList'
  | 'ad'
  | 'horizontalAd'
  | 'categoryColumns'
  | 'webStoriesArea'
  | 'articleGrid'
  | 'heroImages'

export type HomeBlock = {
  id: string
  key: string
  name: string
  type: HomeBlockType
  position: number
  isActive: boolean
  columnKey?: string
  config?: Record<string, unknown>
}

const slugSchema = z
  .string()
  .trim()
  .min(1)
  // Allow dot as well because some deployments may pass a domain-like value.
  // We still coerce/sanitize below for file path safety.
  .regex(/^[a-z0-9.-]+$/i, 'Invalid tenant slug')

const homeBlockSchema: z.ZodType<HomeBlock> = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1) as z.ZodType<HomeBlockType>,
  position: z.number().int().nonnegative(),
  isActive: z.boolean(),
  columnKey: z.string().min(1).optional(),
  config: z.record(z.unknown()).optional(),
})

const homeSectionLayoutSchema: z.ZodType<HomeSectionLayout> = z.union([
  z.object({ type: z.literal('full') }),
  z.object({
    type: z.literal('grid'),
    columns: z.array(
      z.object({
        key: z.string().min(1),
        name: z.string().min(1),
        position: z.number().int().nonnegative(),
      }),
    ),
  }),
])

const homeSectionSchema: z.ZodType<HomeSection> = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  name: z.string().min(1),
  position: z.number().int().nonnegative(),
  isActive: z.boolean(),
  layout: homeSectionLayoutSchema,
  blocks: z.array(homeBlockSchema),
})

export const homeLayoutSchema: z.ZodType<HomeLayout> = z.object({
  version: z.number().int().positive(),
  tenantSlug: z.string().min(1),
  themeKey: z.enum(['style1', 'style2', 'style3', 'tv9']),
  updatedAt: z.string().min(1),
  sections: z.array(homeSectionSchema),
})

function safeTenantSlug(input: string) {
  const raw = String(input ?? '').trim().toLowerCase()
  if (!raw) return 'demo'

  // 1) accept as-is if valid
  const direct = slugSchema.safeParse(raw)
  if (direct.success) return direct.data

  // 2) if it looks like a domain, take first label
  if (raw.includes('.')) {
    const first = raw.split('.')[0].trim()
    const parsedFirst = slugSchema.safeParse(first)
    if (parsedFirst.success) return parsedFirst.data
  }

  // 3) sanitize: replace invalid chars with '-', collapse repeats
  const sanitized = raw
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')

  const parsedSanitized = slugSchema.safeParse(sanitized)
  if (parsedSanitized.success) return parsedSanitized.data

  return 'demo'
}

function layoutPathForTenant(tenantSlug: string) {
  const slug = safeTenantSlug(tenantSlug)
  return path.join(DATA_DIR, `${slug}.json`)
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

export function defaultHomeLayout(tenantSlug: string, themeKey: HomeLayoutThemeKey = 'style1'): HomeLayout {
  const now = new Date().toISOString()
  const slug = safeTenantSlug(tenantSlug)

  if (themeKey === 'style2') {
    return {
      version: 1,
      tenantSlug: slug,
      themeKey,
      updatedAt: now,
      sections: [
        {
          id: 's-ticker',
          key: 'flashTicker',
          name: 'Breaking / Flash Ticker Strip',
          position: 1,
          isActive: true,
          layout: { type: 'full' },
          blocks: [
            { id: 'b-ticker', key: 'flashTicker', name: 'Flash Ticker', type: 'flashTicker', position: 1, isActive: true, config: { maxItems: 12 } },
          ],
        },
        {
          id: 's-toi-grid',
          key: 'toiGrid3',
          name: 'Main Grid (TOI-style 3 Columns)',
          position: 2,
          isActive: true,
          layout: {
            type: 'grid',
            columns: [
              { key: 'col-left', name: 'Left Rail', position: 1 },
              { key: 'col-center', name: 'Center Lead', position: 2 },
              { key: 'col-right', name: 'Right Rail', position: 3 },
            ],
          },
          blocks: [
            {
              id: 'b-left-category',
              key: 'leftCategory',
              name: 'In The News',
              type: 'categoryBlock',
              position: 1,
              isActive: true,
              columnKey: 'col-left',
              config: {
                categorySource: 'navFirstOrEnv',
                envCategoryKey: 'NEXT_PUBLIC_LEFT_RAIL_CATEGORY',
                count: 10,
                listStyle: 'cards',
              },
            },
            {
              id: 'b-left-ad',
              key: 'leftAd',
              name: 'Ad',
              type: 'ad',
              position: 2,
              isActive: true,
              columnKey: 'col-left',
              config: { label: 'Advertisement', minHeight: 220 },
            },
            {
              id: 'b-left-ad-2',
              key: 'leftAd2',
              name: 'Ad',
              type: 'ad',
              position: 3,
              isActive: true,
              columnKey: 'col-left',
              config: { label: 'Advertisement', minHeight: 220, fill: true },
            },

            { id: 'b-hero', key: 'heroLead', name: 'Lead Story', type: 'heroLead', position: 1, isActive: true, columnKey: 'col-center', config: { count: 1, offset: 0 } },
            { id: 'b-medium', key: 'mediumCards', name: 'Top Picks', type: 'mediumCards', position: 2, isActive: true, columnKey: 'col-center', config: { count: 2, offset: 1 } },
            { id: 'b-more', key: 'smallList', name: 'More Stories', type: 'smallList', position: 3, isActive: true, columnKey: 'col-center', config: { count: 8, offset: 3 } },

            { id: 'b-latest', key: 'latestNews', name: 'Latest News', type: 'trendingList', position: 1, isActive: true, columnKey: 'col-right', config: { count: 10, offset: 0 } },
            { id: 'b-mostread', key: 'mostRead', name: 'Most Read', type: 'trendingList', position: 2, isActive: true, columnKey: 'col-right', config: { count: 10, offset: 10 } },
            {
              id: 'b-right-ad',
              key: 'rightAd',
              name: 'Ad',
              type: 'ad',
              position: 3,
              isActive: true,
              columnKey: 'col-right',
              config: { label: 'Advertisement', minHeight: 220 },
            },
            {
              id: 'b-right-ad-2',
              key: 'rightAd2',
              name: 'Ad',
              type: 'ad',
              position: 4,
              isActive: true,
              columnKey: 'col-right',
              config: { label: 'Advertisement', minHeight: 220, fill: true },
            },
          ],
        },
        {
          id: 's-top-stories',
          key: 'topStoriesGrid',
          name: 'Top Stories (Image Grid)',
          position: 3,
          isActive: true,
          layout: { type: 'full' },
          blocks: [
            { id: 'b-top-stories-grid', key: 'topStoriesGrid', name: 'Top Stories', type: 'articleGrid', position: 1, isActive: true, config: { count: 9, offset: 3, columns: 3 } },
          ],
        },
      ],
    }
  }

  if (themeKey === 'style3') {
    return {
      version: 1,
      tenantSlug: slug,
      themeKey,
      updatedAt: now,
      sections: [
        {
          id: 's-grid',
          key: 'feedGrid',
          name: 'Latest Articles Grid',
          position: 1,
          isActive: true,
          layout: { type: 'full' },
          blocks: [
            { id: 'b-article-grid', key: 'articleGrid', name: 'Article Grid', type: 'articleGrid', position: 1, isActive: true },
          ],
        },
      ],
    }
  }

  // style1 (default) mirrors your current `themes/style1` homepage layout.
  return {
    version: 1,
    tenantSlug: slug,
    themeKey,
    updatedAt: now,
    sections: [
      {
        id: 's-ticker',
        key: 'flashTicker',
        name: 'Flash Ticker Strip',
        position: 1,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ id: 'b-ticker', key: 'flashTicker', name: 'Flash Ticker', type: 'flashTicker', position: 1, isActive: true, config: { maxItems: 12 } }],
      },
      {
        id: 's-main-grid',
        key: 'mainGrid4',
        name: 'Main Grid (4 Columns)',
        position: 2,
        isActive: true,
        layout: {
          type: 'grid',
          columns: [
            { key: 'col-1', name: 'Column 1 (Hero Stack)', position: 1 },
            { key: 'col-2', name: 'Column 2 (Last News)', position: 2 },
            { key: 'col-3', name: 'Column 3 (Trending Category)', position: 3 },
            { key: 'col-4', name: 'Column 4 (Ads + Trending Titles)', position: 4 },
          ],
        },
        blocks: [
          { id: 'b-hero', key: 'heroLead', name: 'Hero Lead', type: 'heroLead', position: 1, isActive: true, columnKey: 'col-1' },
          { id: 'b-medium', key: 'mediumCards', name: 'Medium Cards', type: 'mediumCards', position: 2, isActive: true, columnKey: 'col-1', config: { count: 2 } },
          { id: 'b-small', key: 'smallList', name: 'Small List Rows', type: 'smallList', position: 3, isActive: true, columnKey: 'col-1', config: { count: 3 } },

          {
            id: 'b-last-news',
            key: 'lastNewsCategoryBlock',
            name: 'Last News (Category Block)',
            type: 'categoryBlock',
            position: 1,
            isActive: true,
            columnKey: 'col-2',
            config: {
              categorySource: 'navFirstOrEnv',
              envCategoryKey: 'NEXT_PUBLIC_LAST_NEWS_CATEGORY',
              envCountKey: 'NEXT_PUBLIC_LAST_NEWS_COUNT',
              maxItems: 8,
            },
          },

          {
            id: 'b-trending-cat',
            key: 'trendingCategoryBlock',
            name: 'Trending (Category Block)',
            type: 'trendingCategoryBlock',
            position: 1,
            isActive: true,
            columnKey: 'col-3',
            config: { categorySource: 'navSecondOrEnv' },
          },

          { id: 'b-ad-top', key: 'topBannerAd', name: 'Top Banner Ad (16:9)', type: 'ad', position: 1, isActive: true, columnKey: 'col-4', config: { format: '16:9' } },
          {
            id: 'b-trending-list',
            key: 'trendingNewsTitles',
            name: 'Trending News (Titles Only)',
            type: 'trendingList',
            position: 2,
            isActive: true,
            columnKey: 'col-4',
            config: { maxItems: 8 },
          },
          { id: 'b-ad-bottom', key: 'bottomBannerAd', name: 'Bottom Banner Ad', type: 'ad', position: 3, isActive: true, columnKey: 'col-4', config: { format: 'banner' } },
        ],
      },
      {
        id: 's-had-1',
        key: 'horizontalAd1',
        name: 'Horizontal Ad (Below Main Grid)',
        position: 3,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ id: 'b-had-1', key: 'horizontalAd', name: 'Horizontal Ad', type: 'horizontalAd', position: 1, isActive: true, config: { label: 'Horizontal Ad' } }],
      },
      {
        id: 's-cat-hub',
        key: 'categoryHub',
        name: 'Category Hub (4 Columns)',
        position: 4,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ id: 'b-cat-cols', key: 'categoryColumns', name: 'Category Columns', type: 'categoryColumns', position: 1, isActive: true, config: { columns: 4 } }],
      },
      {
        id: 's-had-2',
        key: 'horizontalAd2',
        name: 'Horizontal Ad (Below Category Hub)',
        position: 5,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ id: 'b-had-2', key: 'horizontalAd', name: 'Horizontal Ad', type: 'horizontalAd', position: 1, isActive: true, config: { label: 'Horizontal Ad' } }],
      },
      {
        id: 's-stories',
        key: 'webStories',
        name: 'Web Stories Area',
        position: 6,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ id: 'b-stories', key: 'webStoriesArea', name: 'Web Stories', type: 'webStoriesArea', position: 1, isActive: true }],
      },
      {
        id: 's-had-3',
        key: 'horizontalAd3',
        name: 'Horizontal Ad (Optional)',
        position: 7,
        isActive: false,
        layout: { type: 'full' },
        blocks: [{ id: 'b-had-3', key: 'horizontalAd', name: 'Horizontal Ad', type: 'horizontalAd', position: 1, isActive: false, config: { label: 'Horizontal Ad' } }],
      },
    ],
  }
}

export async function readHomeLayout(tenantSlug: string, themeKey: HomeLayoutThemeKey = 'style1'): Promise<HomeLayout> {
  const slug = safeTenantSlug(tenantSlug)
  const filePath = layoutPathForTenant(slug)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = homeLayoutSchema.safeParse(JSON.parse(raw))
    if (parsed.success && parsed.data.tenantSlug === slug) return parsed.data
  } catch {
    // ignore; fall back
  }
  return defaultHomeLayout(slug, themeKey)
}

export async function writeHomeLayout(tenantSlug: string, layout: unknown): Promise<HomeLayout> {
  const slug = safeTenantSlug(tenantSlug)
  await ensureDataDir()

  const parsed = homeLayoutSchema.parse(layout)
  if (parsed.tenantSlug !== slug) {
    throw new Error('tenantSlug mismatch')
  }

  const normalized: HomeLayout = {
    ...parsed,
    tenantSlug: slug,
    updatedAt: new Date().toISOString(),
  }

  const filePath = layoutPathForTenant(slug)
  await fs.writeFile(filePath, JSON.stringify(normalized, null, 2), 'utf8')
  return normalized
}

export async function resetHomeLayout(tenantSlug: string) {
  const slug = safeTenantSlug(tenantSlug)
  const filePath = layoutPathForTenant(slug)
  try {
    await fs.unlink(filePath)
  } catch {
    // ignore
  }
}

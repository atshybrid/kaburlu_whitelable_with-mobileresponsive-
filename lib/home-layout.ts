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
      columns: Array<{ key: string; name: string; position: number; width?: string }>
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
  | 'section3'
  | 'section4'

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
        width: z.string().optional(),
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
        {
          id: 's-section3',
          key: 'section3',
          name: 'Section 3 (3 Columns: Technology / Education / Also In News)',
          position: 4,
          isActive: true,
          layout: { type: 'full' },
          blocks: [
            {
              id: 'b-section3',
              key: 'section3',
              name: 'Section 3',
              type: 'section3',
              position: 1,
              isActive: true,
              config: {
                columns: [
                  { title: 'Technology', match: 'technology', navIndexFallback: 0 },
                  { title: 'Education', match: 'education', navIndexFallback: 1 },
                  { title: 'Also In News', match: 'news', navIndexFallback: 2 },
                ],
                itemsPerColumn: 3,
              },
            },
          ],
        },
        {
          id: 's-section4',
          key: 'section4',
          name: 'Section 4 (3x3 Category Grid)',
          position: 5,
          isActive: true,
          layout: { type: 'full' },
          blocks: [
            {
              id: 'b-section4',
              key: 'section4',
              name: 'Section 4',
              type: 'section4',
              position: 1,
              isActive: true,
              config: {
                rows: 3,
                cols: 3,
                itemsPerCard: 5,
                // Optional: override with explicit cards[] later via /api/home-layout
                // cards: [{ title, match, categorySlug, navIndexFallback }, ...]
                startNavIndex: 0,
              },
            },
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

  // style1 (default) - Clean organized sections for backend control
  // Each section has: key, name, position, isActive (show/hide), size info
  return {
    version: 1,
    tenantSlug: slug,
    themeKey,
    updatedAt: now,
    sections: [
      // ═══════════════════════════════════════════════════════════════
      // SECTION 1: FLASH TICKER (Breaking News Strip)
      // Position: 1 | Size: Full Width | Height: 40px
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-flash-ticker',
        key: 'flashTicker',
        name: 'Flash Ticker (Breaking News)',
        position: 1,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ 
          id: 'b-ticker', 
          key: 'flashTicker', 
          name: 'Flash Ticker', 
          type: 'flashTicker', 
          position: 1, 
          isActive: true, 
          config: { 
            maxItems: 12,
            size: 'full-width',
            height: '40px',
          } 
        }],
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 2: HERO SECTION (Main Grid - 4 Columns)
      // Position: 2 | Size: Full Width | Layout: 4 Columns Grid
      // Col-1 + Col-2: 15 articles total (no category labels)
      // Col-3: Most Read - 8 articles (with label)
      // Col-4: Top Viewed - 4 articles (with label)
      // Total: 27 articles
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-hero-section',
        key: 'heroSection',
        name: 'Hero Section (4 Column Grid)',
        position: 2,
        isActive: true,
        layout: {
          type: 'grid',
          columns: [
            { key: 'col-1', name: 'Hero Lead Column', position: 1, width: '25%' },
            { key: 'col-2', name: 'Latest Articles', position: 2, width: '25%' },
            { key: 'col-3', name: 'Most Read', position: 3, width: '25%' },
            { key: 'col-4', name: 'Top Viewed', position: 4, width: '25%' },
          ],
        },
        blocks: [
          // ─────────────────────────────────────────────────────────
          // Col-1: Hero Lead (1) + Medium Cards (2) + Small List (5) = 8 articles
          // ─────────────────────────────────────────────────────────
          { 
            id: 'b-hero-lead', 
            key: 'heroLead', 
            name: 'Hero Lead Image', 
            type: 'heroLead', 
            position: 1, 
            isActive: true, 
            columnKey: 'col-1',
            config: { 
              count: 1, 
              size: 'large',
              showCategoryLabel: false,  // No category link
            }
          },
          { 
            id: 'b-medium-cards', 
            key: 'mediumCards', 
            name: 'Medium Cards', 
            type: 'mediumCards', 
            position: 2, 
            isActive: true, 
            columnKey: 'col-1', 
            config: { 
              count: 2, 
              size: 'medium',
              showCategoryLabel: false,
            } 
          },
          { 
            id: 'b-small-list-col1', 
            key: 'smallListCol1', 
            name: 'Small List Col1', 
            type: 'smallList', 
            position: 3, 
            isActive: true, 
            columnKey: 'col-1', 
            config: { 
              count: 5, 
              showLabel: false,
              showCategoryLabel: false,
            } 
          },

          // ─────────────────────────────────────────────────────────
          // Col-2: Latest Articles (7 articles, no label, no category)
          // Total Col-1 + Col-2 = 8 + 7 = 15 articles
          // ─────────────────────────────────────────────────────────
          {
            id: 'b-latest-articles',
            key: 'latestArticles',
            name: 'Latest Articles',
            type: 'smallList',
            position: 1,
            isActive: true,
            columnKey: 'col-2',
            config: {
              count: 7,
              showLabel: false,
              showCategoryLabel: false,
              source: 'latest',
            },
          },

          // ─────────────────────────────────────────────────────────
          // Col-3: Most Read (8 articles, with label)
          // ─────────────────────────────────────────────────────────
          {
            id: 'b-most-read',
            key: 'mostRead',
            name: 'Most Read Section',
            type: 'smallList',
            position: 1,
            isActive: true,
            columnKey: 'col-3',
            config: { 
              count: 8,
              showLabel: true,
              labelText: 'Most Read',
              showCategoryLabel: false,
              source: 'mostRead',
            },
          },

          // ─────────────────────────────────────────────────────────
          // Col-4: Top Viewed (4 articles, with label) + Ads
          // ─────────────────────────────────────────────────────────
          { 
            id: 'b-ad-728x90-top', 
            key: 'adTopBanner', 
            name: 'Ad Banner Top', 
            type: 'ad', 
            position: 1, 
            isActive: true, 
            columnKey: 'col-4', 
            config: { 
              size: '300x250',
              type: 'none', // 'google' | 'local' | 'none'
              // google: { adClient: 'ca-pub-xxx', adSlot: '123456' },
              // local: { imageUrl: '/ads/banner.jpg', targetUrl: 'https://example.com' },
            } 
          },
          {
            id: 'b-top-viewed',
            key: 'topViewed',
            name: 'Top Viewed Articles',
            type: 'smallList',
            position: 2,
            isActive: true,
            columnKey: 'col-4',
            config: { 
              count: 4,
              showLabel: true,
              labelText: 'Top Viewed',
              showCategoryLabel: false,
              source: 'topViewed',
            },
          },
          { 
            id: 'b-ad-728x90-bottom', 
            key: 'adBottomBanner', 
            name: 'Ad Banner Bottom', 
            type: 'ad', 
            position: 3, 
            isActive: true, 
            columnKey: 'col-4', 
            config: { 
              size: '300x250',
              type: 'none', // 'google' | 'local' | 'none'
            } 
          },
        ],
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 3: HORIZONTAL AD 1 (Below Hero)
      // Position: 3 | Size: Full Width | Height: 90px or 250px
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-horizontal-ad-1',
        key: 'horizontalAd1',
        name: 'Horizontal Ad 1 (Below Hero)',
        position: 3,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ 
          id: 'b-h-ad-1', 
          key: 'horizontalAd1', 
          name: 'Horizontal Ad', 
          type: 'horizontalAd', 
          position: 1, 
          isActive: true, 
          config: { 
            size: '728x90',
            type: 'none', // 'google' | 'local' | 'none'
            // google: { adClient: 'ca-pub-xxx', adSlot: '123456' },
            // local: { imageUrl: '/ads/horizontal.jpg', targetUrl: 'https://example.com' },
          } 
        }],
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 4: CATEGORY SECTION 1 (4 Categories, 5 articles each = 20 articles)
      // Position: 4 | Layout: 4 Categories + Sidebar Ad
      // Categories: జాతీయం, వినోదం, రాజకీయాలు, క్రీడలు
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-category-1',
        key: 'categorySection1',
        name: 'Category Section 1 (4 Categories)',
        position: 4,
        isActive: true,
        layout: { 
          type: 'grid',
          columns: [
            { key: 'main', name: 'Main Content', position: 1, width: '70%' },
            { key: 'sidebar', name: 'Sidebar Ads', position: 2, width: '30%' },
          ],
        },
        blocks: [
          { 
            id: 'b-cat1-block', 
            key: 'categorySection1Block', 
            name: 'Category Section 1 Block', 
            type: 'categoryBlock', 
            position: 1, 
            isActive: true, 
            columnKey: 'main',
            config: { 
              categoriesCount: 4,
              articlesPerCategory: 5,
              categories: [
                { slug: 'national', label: 'జాతీయం', position: 1 },
                { slug: 'entertainment', label: 'వినోదం', position: 2 },
                { slug: 'politics', label: 'రాజకీయాలు', position: 3 },
                { slug: 'sports', label: 'క్రీడలు', position: 4 },
              ],
              layout: 'hero-grid',  // Each category shows 1 hero + 4 grid
            } 
          },
          { 
            id: 'b-cat1-sidebar-ad', 
            key: 'category1SidebarAd', 
            name: 'Sidebar Ad (300×600)', 
            type: 'ad', 
            position: 1, 
            isActive: true, 
            columnKey: 'sidebar',
            config: { 
              size: '300x600',
              sticky: true,
              type: 'none', // 'google' | 'local' | 'none'
              // google: { adClient: 'ca-pub-xxx', adSlot: '123456' },
              // local: { imageUrl: '/ads/sidebar.jpg', targetUrl: 'https://example.com' },
            } 
          },
        ],
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 5: CATEGORY SECTION 2 (4 Categories, 5 articles each = 20 articles)
      // Position: 5 | Layout: 4 Categories + Sidebar Ad
      // Categories: వ్యాపారం, సాంకేతికం, ఆరోగ్యం, శిక్షణ
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-category-2',
        key: 'categorySection2',
        name: 'Category Section 2 (4 Categories)',
        position: 5,
        isActive: true,
        layout: { 
          type: 'grid',
          columns: [
            { key: 'main', name: 'Main Content', position: 1, width: '70%' },
            { key: 'sidebar', name: 'Sidebar Ads', position: 2, width: '30%' },
          ],
        },
        blocks: [
          { 
            id: 'b-cat2-block', 
            key: 'categorySection2Block', 
            name: 'Category Section 2 Block', 
            type: 'categoryBlock', 
            position: 1, 
            isActive: true, 
            columnKey: 'main',
            config: { 
              categoriesCount: 4,
              articlesPerCategory: 5,
              categories: [
                { slug: 'business', label: 'వ్యాపారం', position: 1 },
                { slug: 'technology', label: 'సాంకేతికం', position: 2 },
                { slug: 'health', label: 'ఆరోగ్యం', position: 3 },
                { slug: 'education', label: 'శిక్షణ', position: 4 },
              ],
              layout: 'hero-grid',
            } 
          },
          { 
            id: 'b-cat2-sidebar-ad', 
            key: 'category2SidebarAd', 
            name: 'Sidebar Ad (300×600)', 
            type: 'ad', 
            position: 1, 
            isActive: true, 
            columnKey: 'sidebar',
            config: { 
              size: '300x600',
              sticky: true,
              type: 'none', // 'google' | 'local' | 'none'
              // google: { adClient: 'ca-pub-xxx', adSlot: '123456' },
              // local: { imageUrl: '/ads/sidebar.jpg', targetUrl: 'https://example.com' },
            } 
          },
        ],
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 6: HORIZONTAL AD 2 (Below Categories)
      // Position: 6 | Size: Full Width | Height: 90px or 250px
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-horizontal-ad-2',
        key: 'horizontalAd2',
        name: 'Horizontal Ad 2 (Below Categories)',
        position: 6,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ 
          id: 'b-h-ad-2', 
          key: 'horizontalAd2', 
          name: 'Horizontal Ad', 
          type: 'horizontalAd', 
          position: 1, 
          isActive: true, 
          config: { 
            size: '728x90',
            type: 'none', // 'google' | 'local' | 'none'
            // google: { adClient: 'ca-pub-xxx', adSlot: '123456' },
            // local: { imageUrl: '/ads/horizontal.jpg', targetUrl: 'https://example.com' },
          } 
        }],
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 7: CATEGORY HUB (2 Categories per Row, 5 articles each)
      // Position: 7 | Size: Full Width | Layout: 2 Columns Grid
      // Each row has 2 categories, each category has 5 articles
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-category-hub',
        key: 'categoryHub',
        name: 'Category Hub (2 per Row)',
        position: 7,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ 
          id: 'b-category-columns', 
          key: 'categoryColumns', 
          name: 'Category Columns', 
          type: 'categoryColumns', 
          position: 1, 
          isActive: true, 
          config: { 
            columnsPerRow: 2,
            articlesPerCategory: 5,
            categories: [
              { slug: 'crime', label: 'క్రైమ్', position: 1 },
              { slug: 'international', label: 'అంతర్జాతీయం', position: 2 },
              { slug: 'lifestyle', label: 'జీవనశైలి', position: 3 },
              { slug: 'science', label: 'సైన్స్', position: 4 },
            ],
          } 
        }],
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 8: WEB STORIES
      // Position: 8 | Size: Full Width | Layout: Horizontal Scroll Carousel
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-web-stories',
        key: 'webStories',
        name: 'Web Stories Carousel',
        position: 8,
        isActive: true,
        layout: { type: 'full' },
        blocks: [{ 
          id: 'b-web-stories', 
          key: 'webStoriesArea', 
          name: 'Web Stories', 
          type: 'webStoriesArea', 
          position: 1, 
          isActive: true,
          config: {
            maxItems: 10,
            layout: 'carousel',
            cardSize: '150×200',
          }
        }],
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 9: HORIZONTAL AD 3 (Optional - Below Web Stories)
      // Position: 9 | Size: Full Width | Height: 90px or 250px
      // ═══════════════════════════════════════════════════════════════
      {
        id: 's-horizontal-ad-3',
        key: 'horizontalAd3',
        name: 'Horizontal Ad 3 (Optional)',
        position: 9,
        isActive: false, // Disabled by default
        layout: { type: 'full' },
        blocks: [{ 
          id: 'b-h-ad-3', 
          key: 'horizontalAd3', 
          name: 'Horizontal Ad', 
          type: 'horizontalAd', 
          position: 1, 
          isActive: false, 
          config: { 
            size: '728x90',
            type: 'none', // 'google' | 'local' | 'none'
            // google: { adClient: 'ca-pub-xxx', adSlot: '123456' },
            // local: { imageUrl: '/ads/horizontal.jpg', targetUrl: 'https://example.com' },
          } 
        }],
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

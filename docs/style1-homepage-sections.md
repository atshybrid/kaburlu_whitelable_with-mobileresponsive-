# Style1 Homepage – Sections, Columns, Labels, and Data Sources

This project renders the **Style1** homepage using:

1) A **layout definition** (sections/columns/blocks) stored per tenant in `.data/home-layout/<tenant>.json`.
   - If the file is missing, it falls back to `defaultHomeLayout(..., 'style1')`.
2) A **remote homepage payload** from the backend: `GET /public/homepage?v=1&themeKey=style1&lang=<lang>`.
   - That payload can provide section **labels** and **categorySlug** via `section.query`.
   - If remote homepage data is missing/empty, the UI falls back to category-based fetches and/or tenant home feed.

---

## 1) Entry Point (where Style1 home is selected)

- Homepage route: [app/(routes)/t/[tenant]/(site)/page.tsx](../app/(routes)/t/%5Btenant%5D/(site)/page.tsx)
  - Resolves tenant + theme.
  - Loads `ThemeHome` from `themes/style1` when `tenant.themeKey === 'style1'`.

- Style1 implementation: [themes/style1/index.tsx](../themes/style1/index.tsx)

---

## 2) Style1 Layout: Sections and Columns (local layout file)

Defined in: [lib/home-layout.ts](../lib/home-layout.ts)

### Section A — `flashTicker` (Full width)
- **Section key**: `flashTicker`
- **Section name (default)**: `Flash Ticker Strip`
- **Block type**: `flashTicker`
- **What it shows**: scrolling breaking/ticker items.
- **Data source**:
  - Prefer remote homepage section type `ticker` (`homepage.data[section.id]`).
  - Fallback: `getHomeFeed()` articles.

### Section B — `mainGrid4` (4 columns)
- **Section key**: `mainGrid4`
- **Section name (default)**: `Main Grid (4 Columns)`

**Columns inside `mainGrid4`:**

#### Column 1 — `col-1` (Hero Stack)
- **Column name (default)**: `Column 1 (Hero Stack)`
- **Blocks**:
  - `heroLead` → main big headline + image
  - `mediumCards` → 2 medium cards
  - `smallList` → 3 small rows
- **Data source**:
  - Prefer remote homepage section type `heroStack`.
  - Fallback: `getHomeFeed()` articles.

#### Column 2 — `col-2` (Last News)
- **Column name (default)**: `Column 2 (Last News)`
- **Block**: `categoryBlock`
- **Label shown on UI**:
  - Prefer remote homepage section type `listWithThumb` → `section.label`.
  - Fallback: chosen category name (or `Last News`).
- **Category link**:
  - Uses `categoryHref(tenantSlug, categorySlug)` → `/t/<tenant>/category/<slug>`.
- **Data source**:
  - Prefer remote homepage section type `listWithThumb` data.
  - If remote data empty, it tries `section.query`:
    - `query.kind === 'category'` and `query.categorySlug` → fetch `getArticlesByCategory(categorySlug)`.
  - If still empty, final fallback component chooses category from nav:
    - `NEXT_PUBLIC_LAST_NEWS_CATEGORY` (optional override)
    - `NEXT_PUBLIC_LAST_NEWS_COUNT` (optional count)
    - otherwise uses first nav category.

#### Column 3 — `col-3` (Trending Category)
- **Column name (default)**: `Column 3 (Trending Category)`
- **Block**: `trendingCategoryBlock`
- **Label shown on UI**:
  - Prefer remote homepage section type `twoColRows` → `section.label`.
  - Fallback: chosen category name.
- **Category link**:
  - Uses `categoryHref(tenantSlug, categorySlug)`.
- **Data source**:
  - Prefer remote homepage `twoColRows` data.
  - If remote data empty, tries `section.query.kind='category'` + `query.categorySlug`.
  - Final fallback component uses nav category:
    - `NEXT_PUBLIC_TRENDING_CATEGORY` (optional override), otherwise first nav category.

#### Column 4 — `col-4` (Ads + Trending Titles)
- **Column name (default)**: `Column 4 (Ads + Trending Titles)`
- **Blocks**:
  - `ad` (top, 16:9 placeholder)
  - `trendingList` (titles only)
  - `ad` (bottom banner placeholder)
- **Label shown on UI**:
  - Prefer remote homepage section type `titlesOnly` → `section.label`.
  - Fallback: `Trending News`.
- **Data source**:
  - Prefer remote homepage section type `titlesOnly` data.
  - Fallback: `getHomeFeed()` articles.

### Section C — `horizontalAd1` (Full width)
- **Section key**: `horizontalAd1`
- **Block type**: `horizontalAd`
- **What it shows**: a horizontal ad placeholder.

### Section D — `categoryHub` (Full width)
- **Section key**: `categoryHub`
- **Block type**: `categoryColumns`
- **What it shows**: 4 category columns; each column is a category box.
- **Category links**:
  - Each column title links to `/t/<tenant>/category/<slug>`
- **Data source**:
  - Categories from `getCategoriesForNav()`.
  - For each chosen category (first 4): `getArticlesByCategory(categorySlug)`.

### Section E — `horizontalAd2` (Full width)
- Same as `horizontalAd1`.

### Section F — `webStories` (Full width)
- **Section key**: `webStories`
- **Block type**: `webStoriesArea`
- **What it shows**:
  - Web Stories header + grid + player
  - “HGBlock” below it (2 category blocks)
  - right-side sticky vertical ad placeholders (desktop only)
- **Category link + data**:
  - Picks a category for the “View More” link:
    - `NEXT_PUBLIC_WEBSTORIES_CATEGORY` override, else first nav category.
  - HGBlock uses first 2 nav categories, each fetched via `getArticlesByCategory()`.

---

## 3) How category pages fetch data

- Category page route: [app/(routes)/t/[tenant]/category/[slug]/page.tsx](../app/(routes)/t/%5Btenant%5D/category/%5Bslug%5D/page.tsx)
- Fetch: `getArticlesByCategory(tenant.id, slug)`.

### Actual backend request
`getArticlesByCategory()` calls the active `DataSource` (remote-only):

- Implemented in: [lib/data-sources/index.ts](../lib/data-sources/index.ts)
- Requests (tries these in order):
  - `/public/articles?category=<slug>&page=1&pageSize=12`
  - `/public/categories/<slug>/articles?page=1&pageSize=12`

The backend base URL is controlled by:
- `API_BASE_URL` (default: `https://app.kaburlumedia.com/api/v1`)

---

## 4) Where navigation categories come from

- Implemented in: [lib/categories.ts](../lib/categories.ts)
- Requests:
  - If language != `en`, tries: `/public/category-translations?languageCode=<lang>`
  - Otherwise: `/public/categories?includeChildren=true&languageCode=<lang>`

Language comes from domain settings (remote):
- `getEffectiveSettings()`

---

## 5) Quick “label names” cheat-sheet (Style1)

These are the **human-friendly labels** you will see (or can configure from backend `/public/homepage`):

- `ticker` → “Breaking / Flash Ticker”
- `heroStack` → “Top Stories / Lead Stack”
- `listWithThumb` → “Last News” (category-based list)
- `twoColRows` → “Trending News” (category-based two-column rows)
- `titlesOnly` → “Trending News” (titles-only list)
- Category Columns → each category name (Politics, Business, etc.)
- Web Stories → “Web Stories”

If you want different words for these titles, the cleanest way is:
- Configure `label` for each section in the backend `/public/homepage` response (preferred)
- Or use env overrides for category choice (fallback path):
  - `NEXT_PUBLIC_LAST_NEWS_CATEGORY`
  - `NEXT_PUBLIC_LAST_NEWS_COUNT`
  - `NEXT_PUBLIC_TRENDING_CATEGORY`
  - `NEXT_PUBLIC_WEBSTORIES_CATEGORY`

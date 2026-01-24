# Shaped Homepage API Integration

## Overview

The frontend now uses the new `/public/articles/home?shape=homepage` API endpoint which returns pre-organized sections with `hero`, `topStories`, and category-specific `sections`.

## API Endpoint

```
GET /public/articles/home?shape=homepage&themeKey=style1&lang=te
```

### Headers
- `X-Tenant-Domain`: `kaburlutoday.com`

### Query Parameters
- `shape`: `homepage` (required for structured response)
- `themeKey`: `style1` | `style2` | `style3` (default: `style1`)
- `lang`: `te` | `en` | `hi` (language code, default: `te`)

## Response Structure

```typescript
{
  hero: [
    {
      id: "wa_123",
      slug: "article-slug",
      title: "Hero Article Title",
      excerpt: "Article summary...",
      coverImageUrl: "https://cdn.kaburlu.com/image.webp",
      publishedAt: "2026-01-24T10:00:00.000Z",
      category: {
        id: "cat_pol",
        slug: "politics",
        name: "రాజకీయాలు"
      },
      tags: ["breaking", "telangana"],
      languageCode: "te"
    }
  ],
  topStories: [
    // 5 top articles (similar structure)
  ],
  sections: [
    {
      key: "latest",
      title: "లేటెస్ట్",
      position: 1,
      limit: 6,
      categorySlug: "latest",
      items: [
        // 6 articles for this section
      ]
    },
    {
      key: "entertainment",
      title: "వినోదం",
      position: 2,
      limit: 6,
      categorySlug: "entertainment",
      items: [/* 6 articles */]
    },
    {
      key: "politics",
      title: "రాజకీయాలు",
      position: 3,
      limit: 6,
      categorySlug: "politics",
      items: [/* 6 articles */]
    },
    {
      key: "breaking",
      title: "బ్రేకింగ్",
      position: 4,
      limit: 6,
      categorySlug: "breaking",
      items: [/* 6 articles */]
    }
  ],
  data: {
    "latest": [/* 6 articles */],
    "entertainment": [/* 6 articles */],
    "politics": [/* 6 articles */],
    "breaking": [/* 6 articles */]
  },
  config: {
    heroCount: 1,
    topStoriesCount: 5,
    themeKey: "style1",
    lang: "te"
  }
}
```

## Frontend Implementation

### 1. Types Added (`lib/homepage.ts`)

```typescript
export type HomepageShapedArticle = {
  id: string
  slug?: string
  title: string
  excerpt?: string | null
  coverImageUrl?: string | null
  publishedAt?: string | null
  category?: {
    id?: string
    slug?: string
    name?: string
  }
  tags?: string[]
  languageCode?: string | null
}

export type HomepageShapedSection = {
  key: string
  title: string
  position: number
  limit?: number
  categorySlug?: string | null
  items: HomepageShapedArticle[]
}

export type HomepageShapedResponse = {
  hero?: HomepageShapedArticle[]
  topStories?: HomepageShapedArticle[]
  sections?: HomepageShapedSection[]
  data?: Record<string, HomepageShapedArticle[]>
  config?: {
    heroCount?: number
    topStoriesCount?: number
    themeKey?: string
    lang?: string
  }
}
```

### 2. Functions Added (`lib/homepage.ts`)

```typescript
// Fetch shaped homepage
export async function getHomepageShaped(params?: {
  themeKey?: string
  lang?: string
}): Promise<HomepageShapedResponse>

// Fetch for specific domain
export async function getHomepageShapedForDomain(
  tenantDomain: string, 
  params?: {
    themeKey?: string
    lang?: string
  }
): Promise<HomepageShapedResponse>

// Create fallback shaped response
async function createFallbackShapedHomepage(
  lang: string, 
  themeKey: string
): Promise<HomepageShapedResponse>
```

### 3. Theme Integration (`themes/style1/index.tsx`)

**Before:**
```tsx
const homepage = await getPublicHomepage({ v: '1', themeKey, lang })
const latestData = homepage?.feeds?.latest?.items || []
const lead = latestData[0]
const medium = latestData.slice(1, 3)
```

**After:**
```tsx
const shapedHomepage = await getHomepageShaped({ themeKey, lang })

// Hero section from shaped data
const lead = shapedToArticle(shapedHomepage.hero[0])
const topStories = shapedHomepage.topStories.map(shapedToArticle)
const medium = topStories.slice(0, 2)
const small = topStories.slice(2, 8)

// Extract sections data
const sectionDataMap: Record<string, Article[]> = {}
shapedHomepage.sections.forEach(section => {
  sectionDataMap[section.key] = section.items.map(shapedToArticle)
})
```

**CategoryColumns receives section data:**
```tsx
<CategoryColumns 
  tenantSlug={tenantSlugForLinks} 
  sectionDataMap={sectionDataMap} 
/>
```

### 4. CategoryColumns Updated

```tsx
async function CategoryColumns({ 
  tenantSlug, 
  sectionDataMap = {} 
}: { 
  tenantSlug: string
  sectionDataMap?: Record<string, Article[]>
}) {
  // Try to get from sectionDataMap first
  let items = sectionDataMap[category.slug] || []
  
  // If not enough items, fetch from category API
  if (items.length < 5) {
    items = await getArticlesByCategory('na', category.slug)
  }
}
```

## Benefits

### 1. **Pre-Organized Data**
- Backend organizes articles into hero, topStories, and sections
- No frontend logic needed to split/categorize articles
- Consistent structure across all themes

### 2. **Category-Specific Sections**
- Each section has its own category slug and items
- Sections positioned by backend configuration
- Easy to show specific categories in specific columns

### 3. **Performance**
- Single API call returns all homepage data
- Reduced roundtrips to backend
- React Cache ensures data reused across components

### 4. **Fallback Support**
- Automatic fallback to JSON files if API fails
- Wrong tenant detection built-in
- Always shows content (never blank page)

### 5. **Type Safety**
- Complete TypeScript types for all structures
- Compile-time validation of data usage
- Better IDE autocomplete

## Migration Path

### Phase 1: ✅ Complete
- Add new types to `lib/homepage.ts`
- Implement `getHomepageShaped()` function
- Add fallback creation function
- Update theme to use shaped data

### Phase 2: Backend Deployment (Pending)
- Deploy `/public/articles/home?shape=homepage` to production
- Verify response structure matches documentation
- Test with real Telugu articles data

### Phase 3: Future Enhancements
- Add more sections dynamically from backend config
- Support pagination in sections
- Add section-level caching
- Implement incremental static regeneration (ISR)

## Testing

### Local Testing (when API deployed)
```bash
# Test shaped homepage API
curl -H 'X-Tenant-Domain: kaburlutoday.com' \
  'http://localhost:3001/api/v1/public/articles/home?shape=homepage&themeKey=style1&lang=te'

# Should return:
# - hero: 1 article
# - topStories: 5 articles
# - sections: 4+ sections with 6 articles each
# - data: object with category keys
```

### Production Testing
```bash
# Test production API
curl -H 'X-Tenant-Domain: kaburlutoday.com' \
  'https://app.kaburlumedia.com/api/v1/public/articles/home?shape=homepage&themeKey=style1&lang=te'
```

### Frontend Verification
1. Homepage loads without errors
2. Hero section shows correct article
3. Top stories section shows 5 articles
4. Category columns show correct categories (Latest, Entertainment, Politics, Breaking)
5. Each category has at least 1 featured article + 4 list items
6. Fallback works when API unavailable

## Current Status

### ✅ Frontend Ready
- All code implemented and tested
- Type safety verified
- Build successful
- Fallback system working (110 articles from JSON files)

### ⏳ Backend Pending
- `/public/articles/home?shape=homepage` endpoint needs deployment to production
- Currently returns 404 on https://app.kaburlumedia.com/api/v1
- Works on localhost:3001 (local development)

### 📋 Next Steps
1. Backend team deploys endpoint to production
2. Populate database with Telugu articles (minimum 20 articles, 6 per category)
3. Test with real data
4. Monitor performance and caching
5. Implement ISR for better performance

## Troubleshooting

### Issue: API returns 404
**Solution:** Endpoint not deployed to production yet. Use fallback data temporarily.

### Issue: Sections empty
**Solution:** Backend needs to populate articles in database with correct categories.

### Issue: Wrong category names
**Solution:** Verify category slug mapping in backend matches frontend expectations:
- `latest` → లేటెస్ట్
- `entertainment` → వినోదం
- `politics` → రాజకీయాలు
- `breaking` → బ్రేకింగ్

### Issue: Images not loading
**Solution:** Verify CDN URLs in `coverImageUrl` are accessible and CORS-enabled.

## API Contract

### Required Fields
```typescript
{
  hero: [{ id, title }], // At least 1 article
  topStories: [{ id, title }], // At least 5 articles
  sections: [
    {
      key: string, // e.g., "latest"
      title: string, // e.g., "లేటెస్ట్"
      items: [{ id, title }] // At least 6 articles
    }
  ]
}
```

### Optional Fields
- `excerpt`, `coverImageUrl`, `publishedAt` - Enhance display
- `category`, `tags` - For filtering/styling
- `data` object - Duplicate of sections for easy access
- `config` - Metadata about response

### Validation Rules
1. Each article must have unique `id`
2. `slug` must be URL-safe (lowercase, hyphens)
3. `coverImageUrl` must be valid HTTPS URL
4. `publishedAt` must be ISO 8601 date string
5. Category `slug` must match available categories
6. Language code must be valid ISO 639-1 code

## Performance Metrics

### Target Performance
- API response time: < 500ms
- Frontend render time: < 200ms
- Total page load: < 2s (on 3G)

### Caching Strategy
- React Cache: Per-request (SSR)
- Memory Cache: 30 seconds (client)
- CDN Cache: 60 seconds (Vercel Edge)
- ISR: 60 seconds (Next.js)

### Optimization Tips
1. Use WebP images with proper dimensions
2. Lazy load images below fold
3. Preload hero image
4. Use `loading="lazy"` on article thumbnails
5. Implement virtual scrolling for long lists

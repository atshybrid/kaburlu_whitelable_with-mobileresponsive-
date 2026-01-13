# Style1 Simple Layout - Backend API Response Structure

## Overview
Simple homepage layout with:
- **Hero Section**: 1 featured article + 12 articles in 2 columns (13 total)
- **Category Sections**: Remaining articles grouped by categories

## Required API Endpoint

### GET `/api/v1/homepage/style1`
Returns configuration for the style1 homepage layout.

## Response Structure

```json
{
  "version": 1,
  "themeKey": "style1",
  "layout": {
    "heroSection": {
      "enabled": true,
      "articleCount": 13,
      "layout": {
        "featured": 1,
        "columns": 2,
        "articlesPerColumn": 6
      }
    },
    "categorySections": {
      "enabled": true,
      "categories": [
        {
          "id": "cat-1",
          "slug": "politics",
          "name": "Politics",
          "position": 1,
          "articleCount": 10,
          "displayStyle": "grid"
        },
        {
          "id": "cat-2",
          "slug": "business",
          "name": "Business",
          "position": 2,
          "articleCount": 10,
          "displayStyle": "grid"
        },
        {
          "id": "cat-3",
          "slug": "technology",
          "name": "Technology",
          "position": 3,
          "articleCount": 10,
          "displayStyle": "grid"
        },
        {
          "id": "cat-4",
          "slug": "sports",
          "name": "Sports",
          "position": 4,
          "articleCount": 10,
          "displayStyle": "grid"
        },
        {
          "id": "cat-5",
          "slug": "entertainment",
          "name": "Entertainment",
          "position": 5,
          "articleCount": 10,
          "displayStyle": "grid"
        }
      ]
    }
  },
  "data": {
    "heroArticles": [
      {
        "id": "art-1",
        "slug": "breaking-news-article",
        "title": "Breaking News: Major Event Happening Now",
        "excerpt": "This is the excerpt for the featured article...",
        "content": "<p>Full article content here...</p>",
        "coverImage": {
          "url": "https://example.com/images/featured.jpg",
          "alt": "Featured image"
        },
        "category": {
          "id": "cat-1",
          "slug": "politics",
          "name": "Politics"
        },
        "author": {
          "id": "auth-1",
          "name": "John Doe",
          "avatar": "https://example.com/avatars/johndoe.jpg"
        },
        "publishedAt": "2026-01-11T10:30:00Z",
        "readTime": 5
      }
      // ... 12 more articles (total 13)
    ],
    "categoryArticles": {
      "politics": [
        {
          "id": "art-14",
          "slug": "politics-article-1",
          "title": "Political Article Title",
          "excerpt": "Article excerpt...",
          "coverImage": {
            "url": "https://example.com/images/politics1.jpg"
          },
          "category": {
            "id": "cat-1",
            "slug": "politics",
            "name": "Politics"
          },
          "publishedAt": "2026-01-11T09:00:00Z"
        }
        // ... up to 10 articles per category
      ],
      "business": [
        // ... business articles
      ],
      "technology": [
        // ... technology articles
      ],
      "sports": [
        // ... sports articles
      ],
      "entertainment": [
        // ... entertainment articles
      ]
    }
  }
}
```

## Alternative Simplified Response (if using existing endpoint)

If you're using the existing `/api/v1/feed/latest` endpoint, the frontend will fetch:

### 1. Latest Articles (Hero Section)
**GET** `/api/v1/feed/latest?limit=13`

```json
{
  "articles": [
    {
      "id": "art-1",
      "slug": "article-slug",
      "title": "Article Title",
      "excerpt": "Short description...",
      "content": "<p>Full HTML content...</p>",
      "coverImageUrl": "https://example.com/image.jpg",
      "category": {
        "id": "cat-1",
        "slug": "politics",
        "name": "Politics"
      },
      "publishedAt": "2026-01-11T10:30:00Z"
    }
    // ... 12 more articles
  ],
  "total": 13
}
```

### 2. Category Lists
**GET** `/api/v1/categories/{categorySlug}/articles?limit=10`

For each category (politics, business, technology, sports, entertainment):

```json
{
  "category": {
    "id": "cat-1",
    "slug": "politics",
    "name": "Politics"
  },
  "articles": [
    {
      "id": "art-14",
      "slug": "article-slug",
      "title": "Article Title",
      "excerpt": "Short description...",
      "coverImageUrl": "https://example.com/image.jpg",
      "publishedAt": "2026-01-11T09:00:00Z"
    }
    // ... up to 10 articles
  ],
  "total": 10
}
```

## Configuration Storage (Backend Database)

### Table: `homepage_layouts`

```sql
CREATE TABLE homepage_layouts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  theme_key VARCHAR(50) NOT NULL DEFAULT 'style1',
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, theme_key)
);
```

### Sample Config (JSONB column):

```json
{
  "heroSection": {
    "enabled": true,
    "articleCount": 13,
    "source": "latest"
  },
  "categories": [
    {
      "slug": "politics",
      "name": "Politics",
      "position": 1,
      "articleCount": 10
    },
    {
      "slug": "business",
      "name": "Business",
      "position": 2,
      "articleCount": 10
    },
    {
      "slug": "technology",
      "name": "Technology",
      "position": 3,
      "articleCount": 10
    },
    {
      "slug": "sports",
      "name": "Sports",
      "position": 4,
      "articleCount": 10
    },
    {
      "slug": "entertainment",
      "name": "Entertainment",
      "position": 5,
      "articleCount": 10
    }
  ]
}
```

## Frontend Implementation Details

The frontend will:
1. Fetch latest 13 articles for hero section
2. Display 1 large featured article + 12 articles in 2 columns (6 per column)
3. Fetch articles for each configured category
4. Display category sections in order with "View All" links
5. Each category shows up to 10 articles in a grid layout

## Article Object Schema

```typescript
interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  content?: string | null
  coverImage?: {
    url: string
    alt?: string
  }
  coverImageUrl?: string  // Alternative field name
  category?: {
    id: string
    slug: string
    name: string
  }
  author?: {
    id: string
    name: string
    avatar?: string
  }
  publishedAt: string  // ISO 8601 format
  readTime?: number    // Minutes
  tags?: string[]
}
```

## Category Configuration

Categories can be configured in backend with:
- Position (display order)
- Article count limit
- Display style (grid, list, cards)
- Enable/disable toggle

This allows admins to customize which categories appear on homepage and in what order.

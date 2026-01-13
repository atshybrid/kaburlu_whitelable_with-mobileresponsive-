# Enhanced Article Page - Complete Guide

## 🎯 Overview

Professional article page design optimized for:
- **Reader Experience** - Beautiful typography and spacing
- **Ad Revenue** - Strategic ad placement for maximum Google AdSense income
- **Engagement** - Most Read section and related articles
- **SEO** - Proper semantic HTML and meta tags

## 📐 Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATION BAR                        │
├───────────────────────────────┬─────────────────────────┤
│                               │   MOST READ SIDEBAR     │
│   BREADCRUMBS                 │   (Sticky, Scrollable)  │
│                               │   ┌──────────────────┐  │
│   ARTICLE TITLE (Large)       │   │ #1 Article...    │  │
│   Metadata (Date, Author)     │   │ #2 Article...    │  │
│   Social Share Buttons        │   │ #3 Article...    │  │
│                               │   │ #4 Article...    │  │
│   FEATURED IMAGE              │   │ ...              │  │
│                               │   └──────────────────┘  │
│   ARTICLE SUMMARY BOX         │                         │
│   (Highlighted Excerpt)       │   AD UNIT (300x250)     │
│                               │   (Sticky Top)          │
│   ┌─────────────────────┐     │                         │
│   │  HORIZONTAL AD #1   │     │                         │
│   └─────────────────────┘     │   AD UNIT (300x600)     │
│                               │   (Sticky Scroll)       │
│   ARTICLE CONTENT             │                         │
│   Paragraph 1                 │                         │
│   Paragraph 2                 │                         │
│   Paragraph 3                 │                         │
│                               │                         │
│   ┌─────────────────────┐     │                         │
│   │  HORIZONTAL AD #2   │     │                         │
│   │  (Every 3 Paras)    │     │                         │
│   └─────────────────────┘     │                         │
│                               │                         │
│   Paragraph 4                 │                         │
│   Paragraph 5                 │                         │
│   Paragraph 6                 │                         │
│                               │                         │
│   ┌─────────────────────┐     │                         │
│   │  HORIZONTAL AD #3   │     │                         │
│   └─────────────────────┘     │                         │
│                               │                         │
│   ARTICLE CONTENT (cont.)     │                         │
│                               │                         │
│   ┌─────────────────────┐     │                         │
│   │  HORIZONTAL AD #4   │     │                         │
│   └─────────────────────┘     │                         │
│                               │                         │
│   TAGS                        │                         │
│                               │                         │
│   MUST READ SECTION           │                         │
│   (6 Article Cards)           │                         │
│                               │                         │
│   AUTHOR BIO SECTION          │                         │
│   (Photo + Bio + Social)      │                         │
│                               │                         │
│   RELATED ARTICLES            │                         │
│   (3 Column Grid)             │                         │
│                               │                         │
└───────────────────────────────┴─────────────────────────┘
│                       FOOTER                            │
└─────────────────────────────────────────────────────────┘
```

## 💰 Ad Placement Strategy (Google AdSense Optimized)

### Ad Units Summary

| Position | Ad Type | Size | Visibility | Revenue Priority |
|----------|---------|------|------------|------------------|
| **Sidebar Top** | Display | 300x250 | Always visible | ⭐⭐⭐⭐⭐ High |
| **Sidebar Sticky** | Display | 300x600 | Scrolls with user | ⭐⭐⭐⭐⭐ High |
| **Before Content** | Horizontal | 728x90 | Above fold | ⭐⭐⭐⭐ Medium-High |
| **In-Article (Every 3 paras)** | Horizontal | 728x90 | Within content | ⭐⭐⭐⭐⭐ Very High |
| **After Content** | Horizontal | 728x90 | Below article | ⭐⭐⭐ Medium |

### Ad Revenue Optimization Features

1. **Sticky Sidebar Ads**
   - Stays in viewport while scrolling
   - Maximum viewability = Higher CPM
   - 300x600 skyscraper format (premium inventory)

2. **In-Article Ads**
   - Placed every 3 paragraphs by default
   - Native feel within content
   - Higher engagement rates
   - Configurable via `.env` file

3. **Horizontal Display Ads**
   - 728x90 Leaderboard format
   - High CTR placement
   - Labeled as "Advertisement"
   - Rounded corners with shadow

4. **Strategic Placement**
   - Above the fold (before content)
   - Within content (natural breaks)
   - After content (exit intent)
   - Sidebar (persistent visibility)

### Revenue Maximization Tips

```env
# Configure in-article ad frequency
NEXT_PUBLIC_ARTICLE_AD_EVERY_N_PARAGRAPHS=3

# Recommended: 2-4 paragraphs
# - 2 = More ads, higher revenue, more intrusive
# - 3 = Balanced (recommended)
# - 4 = Less intrusive, lower revenue
```

## 📊 Most Read Sidebar

### Features

- **Top 10 Articles** - Trending content
- **Numbered Rankings** - Visual hierarchy (1-3 in red gradient)
- **Sticky Scroll** - Follows user down page
- **Compact Layout** - Title + thumbnail + timestamp
- **Smart Time Display** - "Just now", "5h ago", "2d ago"
- **Custom Scrollbar** - Branded red gradient
- **Max Height** - Scrollable after 300px

### Layout Components

```tsx
┌──────────────────────────────────┐
│ 🔥 MOST READ    │  Trending Now  │  (Header)
├──────────────────────────────────┤
│ [1] Article Title...        [📷] │  (Top 3 - Red badge)
│     5h ago                        │
├──────────────────────────────────┤
│ [2] Article Title...        [📷] │
│     12h ago                       │
├──────────────────────────────────┤
│ [3] Article Title...        [📷] │
│     1d ago                        │
├──────────────────────────────────┤
│ [4] Article Title...        [📷] │  (4-10 - Gray badge)
│     2d ago                        │
├──────────────────────────────────┤
│         View All Articles →      │  (Footer Link)
└──────────────────────────────────┘
```

## 🎨 Typography & Reading Experience

### Font Hierarchy

**English Articles:**
- **Headings**: Playfair Display (900 weight)
- **Body Text**: Merriweather (400 weight)
- **UI Elements**: Inter (400-700 weights)

**Indian Language Articles:**
- **All Text**: Noto Sans [Language] (400-800 weights)
- **Auto-switches** based on `defaultLanguage` setting

### Font Sizes

| Element | Desktop | Mobile |
|---------|---------|--------|
| Article Title | 3rem (48px) | 1.875rem (30px) |
| Article Body | 1.125rem (18px) | 1rem (16px) |
| H2 Headings | 1.875rem (30px) | 1.5rem (24px) |
| H3 Headings | 1.5rem (24px) | 1.25rem (20px) |
| Blockquotes | 1.25rem (20px) | 1.125rem (18px) |

### Reading Enhancements

1. **Drop Cap** - First letter of article is 3.5rem, red color
2. **Line Height** - 1.8 (optimal readability)
3. **Max Width** - Constrained for comfortable reading
4. **Link Styling** - Red color with underline
5. **Image Styling** - Rounded corners, responsive
6. **Blockquotes** - Red left border, italic, larger text

## 📱 Responsive Design

### Breakpoints

- **Mobile** (< 640px): Single column, no sidebar
- **Tablet** (640px - 1024px): Single column, no sidebar
- **Desktop** (>= 1024px): 2-column layout with sticky sidebar

### Mobile Optimizations

- Most Read moves below article
- Ads resize to 320x50 mobile format
- Font sizes reduce by 15-20%
- Images responsive with aspect ratio
- Bottom navigation bar for quick access

## 🔧 Configuration Options

### Environment Variables

```env
# Ad placement frequency (paragraphs between ads)
NEXT_PUBLIC_ARTICLE_AD_EVERY_N_PARAGRAPHS=3

# Most Read articles count
NEXT_PUBLIC_MOST_READ_COUNT=10

# Related articles count
NEXT_PUBLIC_RELATED_ARTICLES_COUNT=6
```

### CSS Custom Properties

```css
.theme-style1 {
  --accent: 220 70% 55%;           /* Brand accent color */
  --font-sans: 'Inter', sans-serif; /* UI font */
  --font-serif: 'Merriweather', serif; /* Body font */
  --font-display: 'Playfair Display', serif; /* Heading font */
}
```

## 🎯 SEO Optimization

### Semantic HTML

```html
<article>
  <header>
    <h1>Article Title</h1>
    <time datetime="2026-01-11">...</time>
  </header>
  
  <figure>
    <img src="..." alt="...">
    <figcaption>Image caption</figcaption>
  </figure>
  
  <div class="article-content">
    <!-- Rich content -->
  </div>
</article>
```

### Meta Tags (Auto-generated)

- **Title**: Article title + Site name
- **Description**: Article excerpt (160 chars)
- **OG Tags**: Open Graph for social sharing
- **Twitter Cards**: Enhanced Twitter previews
- **Canonical URL**: Prevents duplicate content
- **Schema.org**: NewsArticle structured data

## 📈 Performance Metrics

### Core Web Vitals Targets

- **LCP** (Largest Contentful Paint): < 2.5s
  - Featured image optimized with `loading="eager"`
  - Sidebar ads lazy loaded

- **FID** (First Input Delay): < 100ms
  - Minimal JavaScript execution
  - Ads load asynchronously

- **CLS** (Cumulative Layout Shift): < 0.1
  - Reserved space for ads
  - Fixed aspect ratios for images

## 💡 Best Practices for Maximum Revenue

### 1. Ad Viewability

```css
/* Sticky ads stay in viewport */
.sticky-ad-unit {
  position: sticky;
  top: 120px;
  z-index: 10;
}
```

### 2. Ad Density

- **Recommended**: 1 ad per 3 paragraphs
- **Maximum**: 1 ad per 2 paragraphs
- **Minimum**: 1 ad per 5 paragraphs

### 3. Ad Sizes Priority

1. **300x600** (Half-Page) - Highest CPM
2. **728x90** (Leaderboard) - High CTR
3. **300x250** (Medium Rectangle) - Standard
4. **320x50** (Mobile Banner) - Mobile only

### 4. Ad Quality

- Always label ads as "Advertisement"
- Maintain 1:1 text-to-ad ratio
- Ensure ads don't overlap content
- Use quality ad networks (Google AdSense)

## 🎨 Component Breakdown

### Article Header

```tsx
<header>
  <h1 className="text-5xl font-bold">Title</h1>
  <div className="metadata">
    <time>Date</time>
    <span>Reading time</span>
    <span>Author</span>
  </div>
  <SocialShareButtons />
</header>
```

### Article Summary Box

```tsx
<div className="summary-box">
  <h3>Article Summary</h3>
  <p>{excerpt}</p>
</div>
```

### Most Read Card

```tsx
<div className="most-read-item">
  <div className="rank-badge">{index + 1}</div>
  <div className="content">
    <h4>{title}</h4>
    <time>{timeAgo}</time>
  </div>
  <img src={thumbnail} />
</div>
```

## 🔄 User Engagement Features

### Social Sharing

- **Facebook** - Blue button with icon
- **Twitter/X** - Sky blue button
- **WhatsApp** - Green button
- **Copy Link** - Gray button

### Must Read Section

- 6 article cards in 3-column grid
- Large images (16:9 aspect ratio)
- Hover effects (scale + shadow)
- Category badges
- Click tracking ready

### Related Articles

- Same category preference
- Fallback to recent articles
- 3-column grid layout
- Card-based design
- Shadow on hover

## 📊 Analytics Integration Ready

### Tracking Points

1. **Page Views** - Article impressions
2. **Scroll Depth** - How far users read
3. **Ad Impressions** - Each ad view
4. **Click Events** - Social shares, related articles
5. **Time on Page** - Reading engagement

### Sample GA4 Events

```javascript
// Article viewed
gtag('event', 'article_view', {
  article_id: 'ABC123',
  category: 'Politics',
  author: 'John Doe'
});

// Ad impression
gtag('event', 'ad_impression', {
  ad_unit: 'sidebar_300x600',
  position: 'sticky'
});
```

## 🎯 Conversion Goals

### Primary Goals

1. **Ad Clicks** - Revenue generation
2. **Page Views** - Engagement metric
3. **Social Shares** - Viral growth
4. **Newsletter Signup** - Email collection
5. **Related Article Clicks** - Session duration

### Secondary Goals

1. **Author Profile Visits**
2. **Category Exploration**
3. **Comment Engagement** (if enabled)
4. **Mobile App Install** (if applicable)

---

**Version**: 2.0.0  
**Last Updated**: January 11, 2026  
**Optimized For**: Google AdSense Revenue + User Experience

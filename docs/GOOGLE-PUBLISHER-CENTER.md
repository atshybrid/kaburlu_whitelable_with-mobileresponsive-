# Google Publisher Center Setup Guide

## Overview

Your Kaburlu news site now generates all feeds required for **Google Publisher Center** and **Google News** indexing.

---

## Feed URLs (auto-generated per domain)

| Feed | URL | Purpose |
|------|-----|---------|
| **RSS Feed** | `https://yourdomain.com/rss` | Primary feed for Publisher Center |
| **Feed XML** | `https://yourdomain.com/feed.xml` | Alternate RSS URL |
| **News Sitemap** | `https://yourdomain.com/sitemap-news.xml` | Google News (last 48h articles) |
| **Sitemap Index** | `https://yourdomain.com/sitemap-index.xml` | Master sitemap |
| **Robots.txt** | `https://yourdomain.com/robots.txt` | Crawler rules |

**Example (kaburlutoday.com):**
```
https://kaburlutoday.com/rss
https://kaburlutoday.com/feed.xml
https://kaburlutoday.com/sitemap-news.xml
```

---

## Step 1: Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://kaburlutoday.com` (or your domain)
3. Verify ownership (meta tag already supported via backend config)
4. Submit sitemaps:
   - `https://yourdomain.com/sitemap-index.xml`
   - `https://yourdomain.com/sitemap-news.xml`

---

## Step 2: Google Publisher Center

1. Go to [Google Publisher Center](https://publishercenter.google.com/)
2. Sign in with the same Google account as Search Console
3. Click **Add publication**
4. Enter:
   - **Publication name:** Kaburlu Today (or your site name)
   - **Primary language:** Telugu (te)
   - **Country:** India
   - **Website URL:** `https://kaburlutoday.com`

---

## Step 3: Add RSS Feed

1. In Publisher Center → **Content** → **Feeds**
2. Click **Add feed**
3. Enter RSS URL:
   ```
   https://kaburlutoday.com/rss
   ```
   Or alternate:
   ```
   https://kaburlutoday.com/feed.xml
   ```
4. Google will validate the feed automatically
5. Save and enable the feed

---

## Step 4: Add News Sitemap

1. In Publisher Center → **Content** → **Sitemaps**
2. Add sitemap URL:
   ```
   https://kaburlutoday.com/sitemap-news.xml
   ```
3. This sitemap includes `news:news` tags for articles from the **last 48 hours**

---

## Step 5: Publication Settings

Configure in Publisher Center:

| Setting | Recommended Value |
|---------|-------------------|
| Primary language | Telugu (te) |
| Content type | News |
| Categories | Politics, Sports, Entertainment, etc. |
| Logo | 512×512 px (from backend branding) |
| Cover image | 1024×576 px |

---

## Step 6: Required Pages (already on site)

Google requires these pages — already included in sitemap:

- `/about-us`
- `/contact`
- `/privacy-policy`
- `/terms`
- `/editorial-policy`
- `/corrections`
- `/ai-policy`

---

## RSS Feed Format

Each article item includes:

```xml
<item>
  <title>Article Title</title>
  <link>https://domain.com/category/slug</link>
  <guid isPermaLink="true">https://domain.com/category/slug</guid>
  <pubDate>Sun, 07 Jun 2026 12:00:00 GMT</pubDate>
  <description>Article summary...</description>
  <author>Reporter Name</author>
  <category>Politics</category>
  <enclosure url="image.jpg" type="image/jpeg" />
  <media:content url="image.jpg" medium="image" />
</item>
```

---

## Google News Sitemap Format

Articles from last 48 hours include:

```xml
<url>
  <loc>https://domain.com/category/slug</loc>
  <lastmod>2026-06-07T12:00:00Z</lastmod>
  <news:news>
    <news:publication>
      <news:name>Site Name</news:name>
      <news:language>te</news:language>
    </news:publication>
    <news:publication_date>2026-06-07T12:00:00Z</news:publication_date>
    <news:title>Article Title</news:title>
  </news:news>
</url>
```

---

## Approval Timeline

| Stage | Time |
|-------|------|
| Feed validation | Instant |
| Search Console indexing | 1–3 days |
| Google News review | 1–4 weeks |
| Full Publisher Center approval | 2–6 weeks |

---

## Checklist Before Submitting

- [ ] Domain verified in Search Console
- [ ] RSS feed loads: `/rss` returns valid XML
- [ ] News sitemap loads: `/sitemap-news.xml`
- [ ] At least 5 recent articles published (last 48h for news sitemap)
- [ ] About, Contact, Privacy, Editorial policy pages live
- [ ] Article pages have proper titles, dates, images
- [ ] Site loads over HTTPS

---

## Test Locally

```bash
# Start dev server
npm run dev

# Test feeds
curl http://localhost:3000/rss
curl http://localhost:3000/feed.xml
curl http://localhost:3000/sitemap-news.xml
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Empty news sitemap | Publish articles within last 48 hours |
| RSS validation failed | Check article titles and pubDate are present |
| Publisher Center rejected | Add editorial policy + about page |
| Feed not updating | Cache refreshes every 15 minutes |

---

## Backend API Requirements

Articles API (`/public/articles`) should return:

```json
{
  "data": [
    {
      "slug": "article-slug",
      "title": "Article Title",
      "excerpt": "Summary text",
      "publishedAt": "2026-06-07T10:00:00Z",
      "updatedAt": "2026-06-07T11:00:00Z",
      "coverImageUrl": "https://cdn.example.com/image.jpg",
      "category": { "slug": "politics", "name": "Politics" },
      "author": { "name": "Reporter Name" }
    }
  ]
}
```

---

*Last updated: June 2026*

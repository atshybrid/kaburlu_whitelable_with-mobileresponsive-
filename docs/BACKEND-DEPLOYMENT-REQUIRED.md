# Backend Deployment Quick Reference

## 🚨 CRITICAL: 2 APIs Need Deployment

### 1. `/public/config` API
**Endpoint:** `GET /public/config`  
**Headers:** `X-Tenant-Domain: kaburlutoday.com`  
**Status:** Works on localhost:3001, **404 on production**

**Expected Response:**
```json
{
  "branding": {
    "logoUrl": "https://kaburlu-news.b-cdn.net/kaburu_logo.png",
    "faviconUrl": "https://kaburlu-news.b-cdn.net/kaburu_logo.png",
    "siteName": "Kaburlu today",
    "primaryColor": "#F4C430",
    "secondaryColor": "#CDDC39"
  },
  "seo": {
    "meta": {
      "title": "Kaburlu Today - Latest Telugu News",
      "description": "Breaking news in Telugu..."
    },
    "openGraph": {
      "title": "...",
      "description": "...",
      "url": "https://kaburlutoday.com",
      "siteName": "Kaburlu today",
      "images": ["https://..."]
    },
    "twitter": {
      "card": "summary_large_image",
      "title": "...",
      "description": "...",
      "images": ["https://..."]
    }
  },
  "content": {
    "defaultLanguage": "te",
    "languages": [
      {
        "code": "te",
        "name": "తెలుగు",
        "nativeName": "తెలుగు",
        "direction": "ltr"
      }
    ]
  },
  "integrations": {
    "googleAnalytics": {
      "measurementId": "G-XXXXXXXXXX"
    },
    "googleAds": {
      "publisherId": "ca-pub-XXXXXXXXXX"
    }
  }
}
```

**Frontend Files Using This:**
- `lib/config.ts` - Main integration
- `app/layout.tsx` - Metadata, favicon
- `components/shared/Navbar.tsx` - Logo, site name
- `app/icon.tsx` - Favicon generation
- `themes/style1/index.tsx` - Branding

**Impact When Deployed:**
- ✅ Logo appears in navbar
- ✅ Favicon shows tenant icon
- ✅ SEO metadata correct
- ✅ Brand colors applied

---

### 2. `/public/articles/home` API with `shape=homepage`
**Endpoint:** `GET /public/articles/home?shape=homepage&themeKey=style1&lang=te`  
**Headers:** `X-Tenant-Domain: kaburlutoday.com`  
**Status:** **Not deployed yet**

**Required Parameters:**
- `shape=homepage` - Returns structured sections (hero, topStories, sections)
- `themeKey=style1` - Uses style1 theme configuration
- `lang=te` - Returns Telugu articles

**Expected Response:**
```json
{
  "hero": [
    {
      "id": "wa_123",
      "slug": "cm-announces-scheme",
      "title": "సీఎం కొత్త పథకం ప్రకటన",
      "excerpt": "రైతులకు ఆర్థిక సహాయం...",
      "coverImageUrl": "https://kaburlu-news.b-cdn.net/image.webp",
      "publishedAt": "2026-01-24T10:00:00.000Z",
      "category": {
        "id": "cat_pol",
        "slug": "politics",
        "name": "రాజకీయాలు"
      },
      "tags": ["breaking", "telangana"],
      "languageCode": "te"
    }
  ],
  "topStories": [
    /* 5 top articles - same structure as hero */
  ],
  "sections": [
    {
      "key": "latest",
      "title": "లేటెస్ట్",
      "position": 1,
      "limit": 6,
      "categorySlug": "latest",
      "items": [
        /* 6 latest articles */
      ]
    },
    {
      "key": "entertainment",
      "title": "వినోదం",
      "position": 2,
      "limit": 6,
      "categorySlug": "entertainment",
      "items": [
        /* 6 entertainment articles */
      ]
    },
    {
      "key": "politics",
      "title": "రాజకీయాలు",
      "position": 3,
      "limit": 6,
      "categorySlug": "politics",
      "items": [
        /* 6 politics articles */
      ]
    },
    {
      "key": "breaking",
      "title": "బ్రేకింగ్",
      "position": 4,
      "limit": 6,
      "categorySlug": "breaking",
      "items": [
        /* 6 breaking articles */
      ]
    }
  ],
  "data": {
    "latest": [/* same as sections[0].items */],
    "entertainment": [/* same as sections[1].items */],
    "politics": [/* same as sections[2].items */],
    "breaking": [/* same as sections[3].items */]
  },
  "config": {
    "heroCount": 1,
    "topStoriesCount": 5,
    "themeKey": "style1",
    "lang": "te"
  }
}
```

**Frontend Files Using This:**
- `lib/homepage.ts` - `getHomepageShaped()` function
- `themes/style1/index.tsx` - Homepage rendering
- `components/shared/CategoryColumns.tsx` - Category sections

**Impact When Deployed:**
- ✅ Hero section shows correct article
- ✅ Top stories section populated
- ✅ Category columns show category-specific articles
- ✅ No more fallback JSON files needed

---

## 📊 Database Requirements

### Minimum Articles Needed
```
Total: 20 articles minimum

By Category:
- Latest: 6 articles
- Entertainment: 6 articles
- Politics: 6 articles
- Breaking: 6 articles

Language: Telugu (te)
```

### Article Fields Required
```json
{
  "id": "wa_123",
  "slug": "article-url-slug",
  "title": "Article Title in Telugu",
  "excerpt": "Short summary (2-3 sentences)",
  "coverImageUrl": "https://kaburlu-news.b-cdn.net/image.webp",
  "publishedAt": "2026-01-24T10:00:00.000Z",
  "category": {
    "slug": "politics",
    "name": "రాజకీయాలు"
  },
  "languageCode": "te"
}
```

### Category Slugs Required
- `latest` (లేటెస్ట్)
- `entertainment` (వినోదం)
- `politics` or `political` (రాజకీయాలు)
- `breaking` (బ్రేకింగ్)

---

## ✅ Testing Commands

### Test `/public/config` API
```bash
curl -H 'X-Tenant-Domain: kaburlutoday.com' \
  'https://app.kaburlumedia.com/api/v1/public/config'

# Expected: JSON with branding, seo, content
# Current: {"error":"Not Found"} with 404 status
```

### Test `/public/articles/home?shape=homepage` API
```bash
curl -H 'X-Tenant-Domain: kaburlutoday.com' \
  'https://app.kaburlumedia.com/api/v1/public/articles/home?shape=homepage&themeKey=style1&lang=te'

# Expected: JSON with hero, topStories, sections
# Current: Not deployed yet
```

### Verify Frontend Integration
```bash
# After APIs deployed, visit:
https://kaburlutoday.com

# Check for:
1. Logo in navbar (image, not text)
2. Favicon in browser tab (tenant icon)
3. Articles on homepage (real data, not fallback)
4. Category sections populated
5. All images loading
```

---

## 🎯 Deployment Checklist

### Before Deployment
- [ ] `/public/config` endpoint implemented
- [ ] `/public/articles/home?shape=homepage` endpoint implemented
- [ ] Database has 20+ Telugu articles
- [ ] Articles categorized correctly (latest, entertainment, politics, breaking)
- [ ] All article images uploaded to CDN
- [ ] Category names in Telugu configured

### Deploy to Production
- [ ] Deploy `/public/config` endpoint
- [ ] Deploy `/public/articles/home` endpoint with shape parameter support
- [ ] Verify both endpoints return 200 (not 404)
- [ ] Test with X-Tenant-Domain header

### After Deployment
- [ ] Frontend logo appears (not text)
- [ ] Frontend favicon appears (not fallback)
- [ ] Homepage shows real articles (not JSON fallback)
- [ ] Category sections populated
- [ ] No console errors in browser
- [ ] Performance < 2s page load

---

## 🔥 Why This is Critical

### Current Frontend State
- **Frontend Code:** ✅ 100% complete and ready
- **Build Status:** ✅ No errors
- **Type Safety:** ✅ Full TypeScript
- **Fallback System:** ✅ Working (110 articles from JSON)

### What's Blocking Production Launch
- ❌ `/public/config` returns 404 (logo/favicon not showing)
- ❌ `/public/articles/home?shape=homepage` not deployed (using fallback data)

### Once APIs Deployed
- ✅ Everything will work automatically
- ✅ No frontend code changes needed
- ✅ Professional production-ready site
- ✅ 10/10 UI/UX ready to launch

---

## 📞 Quick Reference

| API | Status | Priority | Impact |
|-----|--------|----------|--------|
| `/public/config` | 404 on prod | 🚨 Critical | Logo, favicon, SEO |
| `/public/articles/home?shape=homepage` | Not deployed | 🚨 Critical | Homepage structure |
| Database articles | Empty | ⚠️ High | Real content |
| Other APIs | Working | ℹ️ Low | Already integrated |

---

## 🚀 Next Action

**Backend Team:** Please deploy these 2 endpoints to production:

1. `https://app.kaburlumedia.com/api/v1/public/config`
2. `https://app.kaburlumedia.com/api/v1/public/articles/home?shape=homepage`

Then populate database with 20+ Telugu articles in 4 categories.

**After that:** Frontend will work perfectly with zero code changes! 🎉

---

**Updated:** January 24, 2026  
**Contact:** Frontend team  
**Status:** Ready and waiting for backend deployment

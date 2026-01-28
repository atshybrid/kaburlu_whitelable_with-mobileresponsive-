# 📋 STYLE1 HOMEPAGE - BACKEND RESPONSE FORMAT

## 🎯 API Endpoint
```
GET /api/v1/public/homepage/layout?domainName={domain}&themeKey=style1
```

---

## 📦 COMPLETE RESPONSE STRUCTURE

```json
{
  "success": true,
  "data": {
    "version": 1,
    "themeKey": "style1",
    "tenantSlug": "aksharamvoice",
    "updatedAt": "2026-01-27T10:00:00Z",
    
    "sections": [
      {
        "key": "flashTicker",
        "name": "Flash Ticker (Breaking News)",
        "position": 1,
        "isActive": true,
        "config": {
          "maxItems": 12
        },
        "data": {
          "items": [
            { "id": "1", "title": "Breaking news title...", "slug": "breaking-news-slug" }
          ]
        }
      },
      
      {
        "key": "heroSection",
        "name": "Hero Section (4 Column Grid)",
        "position": 2,
        "isActive": true,
        "columns": [
          {
            "key": "col-1",
            "name": "Hero Lead Column",
            "config": {
              "heroCount": 1,
              "mediumCount": 2,
              "smallCount": 5,
              "showCategoryLabel": false
            },
            "data": {
              "hero": [{ "id": "1", "title": "...", "slug": "...", "coverImage": { "url": "..." }, "category": { "name": "జాతీయం", "slug": "national" } }],
              "medium": [{ "id": "2", "title": "...", "slug": "...", "coverImage": { "url": "..." } }, { "id": "3", "title": "...", "slug": "...", "coverImage": { "url": "..." } }],
              "small": [{ "id": "4", "title": "...", "slug": "..." }, { "id": "5", "title": "...", "slug": "..." }, { "id": "6", "title": "...", "slug": "..." }, { "id": "7", "title": "...", "slug": "..." }, { "id": "8", "title": "...", "slug": "..." }]
            }
          },
          {
            "key": "col-2",
            "name": "Latest Articles",
            "config": {
              "count": 7,
              "showLabel": false,
              "showCategoryLabel": false
            },
            "data": {
              "articles": [
                { "id": "9", "title": "Article 1", "slug": "article-1", "coverImage": { "url": "..." } },
                { "id": "10", "title": "Article 2", "slug": "article-2", "coverImage": { "url": "..." } }
              ]
            }
          },
          {
            "key": "col-3",
            "name": "Most Read",
            "config": {
              "count": 8,
              "showLabel": true,
              "labelText": "Most Read",
              "showCategoryLabel": false
            },
            "data": {
              "articles": [
                { "id": "16", "title": "Most Read 1", "slug": "most-read-1", "coverImage": { "url": "..." } }
              ]
            }
          },
          {
            "key": "col-4",
            "name": "Top Viewed",
            "config": {
              "count": 4,
              "showLabel": true,
              "labelText": "Top Viewed",
              "showCategoryLabel": false
            },
            "ads": {
              "top": {
                "type": "google",
                "size": "728x90",
                "google": { "client": "ca-pub-xxx", "slot": "123456" }
              },
              "bottom": {
                "type": "local",
                "size": "728x90",
                "local": { "imageUrl": "https://...", "clickUrl": "https://...", "alt": "Ad" }
              }
            },
            "data": {
              "articles": [
                { "id": "24", "title": "Top Viewed 1", "slug": "top-viewed-1", "coverImage": { "url": "..." } }
              ]
            }
          }
        ]
      },
      
      {
        "key": "horizontalAd1",
        "name": "Horizontal Ad 1",
        "position": 3,
        "isActive": true,
        "ads": {
          "type": "google",
          "size": "728x90",
          "google": { "client": "ca-pub-xxx", "slot": "789012" }
        }
      },
      
      {
        "key": "categorySection1",
        "name": "Category Section 1",
        "position": 4,
        "isActive": true,
        "config": {
          "categoriesCount": 4,
          "articlesPerCategory": 5,
          "layout": "hero-grid"
        },
        "categories": [
          {
            "slug": "national",
            "label": "జాతీయం",
            "position": 1,
            "data": {
              "articles": [
                { "id": "28", "title": "National 1", "slug": "national-1", "coverImage": { "url": "..." } }
              ]
            }
          },
          {
            "slug": "entertainment",
            "label": "వినోదం",
            "position": 2,
            "data": {
              "articles": []
            }
          },
          {
            "slug": "politics",
            "label": "రాజకీయాలు",
            "position": 3,
            "data": {
              "articles": []
            }
          },
          {
            "slug": "sports",
            "label": "క్రీడలు",
            "position": 4,
            "data": {
              "articles": []
            }
          }
        ],
        "ads": {
          "sidebar": {
            "type": "local",
            "size": "300x600",
            "sticky": true,
            "local": { "imageUrl": "https://...", "clickUrl": "https://...", "alt": "Sidebar Ad" }
          }
        }
      },
      
      {
        "key": "categorySection2",
        "name": "Category Section 2",
        "position": 5,
        "isActive": true,
        "config": {
          "categoriesCount": 4,
          "articlesPerCategory": 5
        },
        "categories": [
          { "slug": "business", "label": "వ్యాపారం", "position": 1, "data": { "articles": [] } },
          { "slug": "technology", "label": "సాంకేతికం", "position": 2, "data": { "articles": [] } },
          { "slug": "health", "label": "ఆరోగ్యం", "position": 3, "data": { "articles": [] } },
          { "slug": "education", "label": "శిక్షణ", "position": 4, "data": { "articles": [] } }
        ],
        "ads": {
          "sidebar": {
            "type": "none"
          }
        }
      },
      
      {
        "key": "horizontalAd2",
        "name": "Horizontal Ad 2",
        "position": 6,
        "isActive": true,
        "ads": {
          "type": "none"
        }
      },
      
      {
        "key": "categoryHub",
        "name": "Category Hub",
        "position": 7,
        "isActive": true,
        "config": {
          "columnsPerRow": 2,
          "articlesPerCategory": 5
        },
        "categories": [
          { "slug": "crime", "label": "క్రైమ్", "position": 1, "data": { "articles": [] } },
          { "slug": "international", "label": "అంతర్జాతీయం", "position": 2, "data": { "articles": [] } },
          { "slug": "lifestyle", "label": "జీవనశైలి", "position": 3, "data": { "articles": [] } },
          { "slug": "science", "label": "సైన్స్", "position": 4, "data": { "articles": [] } }
        ]
      },
      
      {
        "key": "webStories",
        "name": "Web Stories",
        "position": 8,
        "isActive": true,
        "config": {
          "maxItems": 10,
          "layout": "carousel"
        },
        "data": {
          "stories": [
            { "id": "s1", "title": "Story 1", "thumbnailUrl": "...", "storyUrl": "..." }
          ]
        }
      },
      
      {
        "key": "horizontalAd3",
        "name": "Horizontal Ad 3",
        "position": 9,
        "isActive": false,
        "ads": {
          "type": "none"
        }
      }
    ]
  }
}
```

---

## 🎨 ADS CONFIGURATION

### Ad Types
| Type | Description |
|------|-------------|
| `google` | Google AdSense Ad |
| `local` | Custom local/banner ad |
| `none` | No ad (show placeholder or hide) |

### Ad Object Structure

```json
{
  "type": "google | local | none",
  "size": "728x90 | 300x600 | 970x250 | 300x250",
  "sticky": false,
  
  "google": {
    "client": "ca-pub-xxxxxxxx",
    "slot": "1234567890",
    "format": "auto",
    "responsive": true
  },
  
  "local": {
    "imageUrl": "https://example.com/ad-image.jpg",
    "clickUrl": "https://example.com/landing-page",
    "alt": "Advertisement",
    "logoUrl": "https://example.com/advertiser-logo.png"
  }
}
```

---

## 📊 SECTION SUMMARY

| Position | Key | Articles | Ads |
|----------|-----|----------|-----|
| 1 | `flashTicker` | 12 items | - |
| 2 | `heroSection` | 27 total | 2 (col-4) |
| 3 | `horizontalAd1` | - | 1 |
| 4 | `categorySection1` | 20 (4×5) | 1 sidebar |
| 5 | `categorySection2` | 20 (4×5) | 1 sidebar |
| 6 | `horizontalAd2` | - | 1 |
| 7 | `categoryHub` | 20 (4×5) | - |
| 8 | `webStories` | 10 stories | - |
| 9 | `horizontalAd3` | - | 1 (optional) |

**TOTAL: ~87 articles + 10 stories + 6 ads**

---

## 🔧 CONTROLS

### Show/Hide Section
```json
{ "isActive": true }   // Show
{ "isActive": false }  // Hide
```

### Change Order
```json
{ "position": 1 }  // First
{ "position": 5 }  // Fifth
```

### Change Article Count
```json
{ "config": { "count": 10 } }           // Single list
{ "config": { "articlesPerCategory": 8 } }  // Per category
```

### Ad Priority Logic (Frontend)
```
1. If type === "google" && google.client && google.slot → Show Google Ad
2. Else if type === "local" && local.imageUrl → Show Local Ad
3. Else → Show Placeholder Banner
```

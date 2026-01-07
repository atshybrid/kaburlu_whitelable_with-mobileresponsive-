# Backend API contracts (needed for full Kaburlu News pages)

This frontend is **remote-only mode** and calls your backend via `API_BASE_URL` with header:

- `X-Tenant-Domain: <tenant-domain>`

Below are the **recommended missing public endpoints** to fully power the new trust/legal pages (and optional location/team pages).

## 1) Static trust/legal pages (recommended)

### GET `/public/pages/:slug`
Used for: About, Privacy Policy, Terms, Disclaimer, Editorial Policy, Corrections Policy, Advertise, Team, Mobile App, Language/Location info pages.

**Query params**
- `lang` (string, optional) e.g. `te`, `en`, `hi`

**Response (example)**
```json
{
  "slug": "privacy-policy",
  "title": "Privacy Policy",
  "updatedAt": "2026-01-05T10:00:00.000Z",
  "lang": "en",
  "contentHtml": "<h2>...</h2><p>...</p>",
  "contentText": null,
  "seo": {
    "metaTitle": "Privacy Policy",
    "metaDescription": "How we handle data and permissions",
    "canonicalPath": "/privacy-policy"
  }
}
```

**Notes**
- `contentHtml` is easiest for the current frontend (it already renders article HTML).
- If you want Markdown, send `contentMarkdown` and we’ll add a renderer.

### GET `/public/pages`
Batch fetch, used to render footer menus or prefetch.

**Query params**
- `slugs` (comma-separated) e.g. `about-us,privacy-policy,terms`
- `lang` (optional)

**Response (example)**
```json
{
  "lang": "en",
  "items": [
    { "slug": "about-us", "title": "About Us", "updatedAt": "2026-01-05T10:00:00.000Z", "contentHtml": "..." },
    { "slug": "privacy-policy", "title": "Privacy Policy", "updatedAt": "2026-01-05T10:00:00.000Z", "contentHtml": "..." }
  ]
}
```

## 2) Location news (optional but useful)

### GET `/public/locations`
Used to power `/location` page lists.

**Response (example)**
```json
{
  "states": [
    { "id": "ts", "name": "Telangana", "slug": "telangana" },
    { "id": "ap", "name": "Andhra Pradesh", "slug": "andhra-pradesh" }
  ]
}
```

### GET `/public/locations/:stateSlug/districts`
**Response (example)**
```json
{
  "state": { "id": "ts", "slug": "telangana", "name": "Telangana" },
  "districts": [
    { "id": "hyd", "slug": "hyderabad", "name": "Hyderabad" },
    { "id": "nlg", "slug": "nalgonda", "name": "Nalgonda" }
  ]
}
```

### GET `/public/articles`
(If your existing articles endpoint already supports these filters, you can reuse it.)

**Suggested query params**
- `locationState` (string)
- `locationDistrict` (string)
- `category` (string)
- `lang` (string)
- `page` (number), `limit` (number)

**Response (example)**
```json
{
  "items": [
    {
      "id": "123",
      "slug": "article-title",
      "title": "Headline",
      "excerpt": "...",
      "content": "<p>...</p>",
      "coverImage": { "url": "https://..." },
      "publishedAt": "2026-01-05T10:00:00.000Z",
      "reporter": { "name": "Reporter Name" },
      "location": { "state": "Telangana", "district": "Hyderabad" }
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 542
}
```

## 3) Team / reporters (recommended for credibility)

### GET `/public/team`
Used for `/our-team`.

**Response (example)**
```json
{
  "editor": { "name": "Editor Name", "photoUrl": null },
  "members": [
    { "name": "Reporter 1", "role": "Reporter", "area": "Hyderabad", "photoUrl": null },
    { "name": "Reporter 2", "role": "Sub Editor", "area": null, "photoUrl": null }
  ]
}
```

## 4) Mobile app links (optional)

### GET `/public/app-links`
Used for `/mobile-app` and app banners.

**Response (example)**
```json
{
  "android": { "playStoreUrl": "https://play.google.com/store/apps/details?id=..." },
  "ios": null
}
```

## Backend must-haves for Play Store compliance

Your **Privacy Policy page content** (whether static or backend-driven) should explicitly mention:

- Firebase push notifications (FCM)
- Location permission usage (local news personalization)
- Camera/media access (reporters only)
- Data safety practices (no selling personal data, security, retention)

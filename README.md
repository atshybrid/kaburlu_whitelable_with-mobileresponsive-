Kaburlu News — Multi-tenant Next.js news platform with 3 themes and REST APIs.

## Prerequisites

- Node.js 18+ and npm

## Quick Start (Windows PowerShell)

1) Configure environment variables:

```powershell
Copy-Item .env.example .env
```

2) Install dependencies:

```powershell
npm install
```

3) Start the dev server:

```powershell
npm run dev
```

Open http://localhost:3000/t/demo to view the demo tenant.

### Use Remote Domain Settings (your API)

Set the base URL and run:

```powershell
echo API_BASE_URL="https://app.kaburlumedia.com/api/v1" >> .env
```

On each request, the server calls `GET /public/domain/settings` with header `X-Tenant-Domain: {host}` to fetch:
- branding.logoUrl, branding.faviconUrl
- seo.defaultMetaTitle/defaultMetaDescription/ogImageUrl
- theme.layout.showTicker/showTopBar

These values drive metadata, logo, and UI toggles in style1. Provide article/category endpoints to fully switch feeds to the remote API.

## Multitenancy

- Path mode (default): routes are under `/t/{tenant}`. Change `MULTITENANT_MODE` to `subdomain` to support `{tenant}.yourdomain.com` and the proxy rewrites to the internal path.

## REST APIs (examples)

- Backend (remote) expected endpoints used by the frontend:
	- `GET {API_BASE_URL}/public/domain/settings` with header `X-Tenant-Domain: {host}` — branding/seo/theme
	- `GET {API_BASE_URL}/public/articles?page=1&pageSize=12` — home feed list (frontend reads `items`)
	- `GET {API_BASE_URL}/public/articles?slug={slug}&pageSize=1` — article by slug (first item)
	- `GET {API_BASE_URL}/public/articles?category={slug}&page=1&pageSize=12` — category listing
	- The frontend will also accept alternative shapes such as `{ item }`, `{ data }`, `{ articles }`.

Note: This project is configured as remote-only (no local Prisma DB). The built-in `/api/*` routes are disabled.

## Themes

Three themes live under `themes/style1|style2|style3`. Tenant theme is chosen via the `themeKey` field.

## Scripts

- `npm run sitemap` — generate static sitemap/robots to `public/`

### Data source
- Remote-only via `API_BASE_URL`.

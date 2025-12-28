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

3) Generate Prisma client and create DB (SQLite by default):

```powershell
npx prisma migrate dev -n init
npm run db:seed
```

4) Start the dev server:

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

- Path mode (default): routes are under `/t/{tenant}`. Change `MULTITENANT_MODE` to `subdomain` to support `{tenant}.yourdomain.com` and the middleware rewrites to the internal path.

## REST APIs (examples)

- Backend (remote) expected endpoints used by the frontend:
	- `GET {API_BASE_URL}/public/domain/settings` with header `X-Tenant-Domain: {host}` — branding/seo/theme
	- `GET {API_BASE_URL}/public/articles?page=1&pageSize=12` — home feed list (frontend reads `items`)
	- `GET {API_BASE_URL}/public/articles?slug={slug}&pageSize=1` — article by slug (first item)
	- `GET {API_BASE_URL}/public/articles?category={slug}&page=1&pageSize=12` — category listing
	- The frontend will also accept alternative shapes such as `{ item }`, `{ data }`, `{ articles }`.

- Local (dev) API in this app (Prisma):
	- `GET /api/tenants` — list tenants
	- `GET /t/{tenant}/api/articles` — list articles for tenant
	- `POST /t/{tenant}/api/articles` — create article (JSON body: `slug`, `title`, `content`, ...)

## Themes

Three themes live under `themes/style1|style2|style3`. Tenant theme is chosen via the `themeKey` field.

## Scripts

- `npm run prisma:migrate` — create dev migration
- `npm run prisma:reset` — reset database
- `npm run db:seed` — seed demo data
- `npm run sitemap` — generate static sitemap/robots to `public/`

### Data source switch
- Set `DATA_SOURCE=remote` to read content from your Node API (default).
- Set `DATA_SOURCE=local` to use the local SQLite database via Prisma.

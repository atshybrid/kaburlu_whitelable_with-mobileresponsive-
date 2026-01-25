# Vercel Multi-Tenant Deployment Guide

## How It Works

This Next.js app automatically detects the incoming domain and loads the correct tenant data from the backend API (`https://app.kaburlumedia.com/api/v1`).

When a user visits **kaburlutoday.com**, the app sends `X-Tenant-Domain: kaburlutoday.com` to the API.
When a user visits **m4news.in**, the app sends `X-Tenant-Domain: m4news.in` to the API.

Each domain gets its own:
- Logo and branding
- Articles and categories
- SEO metadata
- Favicon
- Theme customization

---

## Vercel Deployment Steps

### 1. Create Vercel Project
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 2. Configure Environment Variables in Vercel Dashboard

Go to **Project Settings → Environment Variables** and add:

```
API_BASE_URL=https://app.kaburlumedia.com/api/v1
DATA_SOURCE=remote
NEXT_PUBLIC_DEFAULT_TENANT=kaburlutoday
MULTITENANT_MODE=path
```

⚠️ **IMPORTANT**: Do **NOT** set `HOST` or `NEXT_PUBLIC_HOST` in production!  
These should only be set in `.env.local` for localhost testing.

---

### 3. Add All Your Domains to Vercel

In **Project Settings → Domains**, add all your tenant domains:

1. **kaburlutoday.com** (primary)
   - Add `www.kaburlutoday.com` → redirect to `kaburlutoday.com`

2. **m4news.in**
   - Add `www.m4news.in` → redirect to `m4news.in`

3. **prashnaayudham.com**
   - Add `www.prashnaayudham.com` → redirect to `prashnaayudham.com`

4. **daxintimes.com**
   - Add `www.daxintimes.com` → redirect to `daxintimes.com`

---

### 4. DNS Configuration

For each domain, update your DNS provider (like GoDaddy, Cloudflare, Namecheap):

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait 5-60 minutes for DNS propagation.

---

### 5. Verify Multi-Tenancy

After deployment, test each domain:

```bash
# Test kaburlutoday.com
curl -I https://kaburlutoday.com

# Test m4news.in
curl -I https://m4news.in

# Test prashnaayudham.com
curl -I https://prashnaayudham.com

# Test daxintimes.com
curl -I https://daxintimes.com
```

Each domain should:
- Return 200 OK
- Show correct tenant logo in browser
- Display tenant-specific articles
- Have correct SEO metadata (check page source)

---

## How Domain Detection Works

### Production (Vercel)
```typescript
// Server-side: Auto-detect from request headers
const { headers } = await import('next/headers')
const host = headers().get('host') // kaburlutoday.com or m4news.in etc.
```

### Localhost Testing
```typescript
// Uses .env.local override
const host = process.env.HOST // "kaburlutoday.com" (for testing)
```

### API Request
```typescript
fetch('https://app.kaburlumedia.com/api/v1/public/config', {
  headers: {
    'X-Tenant-Domain': 'kaburlutoday.com' // Dynamically set
  }
})
```

---

## Troubleshooting

### Problem: All domains show same tenant data
**Solution:** Check that `HOST` env var is NOT set in Vercel. Remove it if present.

### Problem: Domain shows 404
**Solution:** Wait for DNS propagation (5-60 min). Check DNS records.

### Problem: API returns wrong tenant
**Solution:** Check backend API `/public/config` endpoint with your domain.

### Problem: Localhost shows wrong tenant
**Solution:** Update `.env.local` with `HOST="yourdesireddomain.com"`

---

## Local Development

For localhost testing, create/update `.env.local`:

```bash
# .env.local (Git ignored)
HOST="kaburlutoday.com"
NEXT_PUBLIC_HOST="kaburlutoday.com"
```

To test different tenants locally:
```bash
# Test kaburlutoday
echo 'HOST="kaburlutoday.com"\nNEXT_PUBLIC_HOST="kaburlutoday.com"' > .env.local
npm run dev

# Test m4news
echo 'HOST="m4news.in"\nNEXT_PUBLIC_HOST="m4news.in"' > .env.local
npm run dev

# Test prashnaayudham
echo 'HOST="prashnaayudham.com"\nNEXT_PUBLIC_HOST="prashnaayudham.com"' > .env.local
npm run dev
```

Then visit http://localhost:3000

---

## Production Checklist

- [ ] Environment variables set in Vercel (without HOST)
- [ ] All domains added to Vercel project
- [ ] DNS A records point to Vercel IP
- [ ] DNS CNAME for www subdomain configured
- [ ] SSL certificates active (automatic via Vercel)
- [ ] Test each domain in browser
- [ ] Verify tenant-specific content loads
- [ ] Check SEO metadata per domain
- [ ] Verify API `/public/config` returns correct data per domain

---

## Performance Optimization

The app uses:
- **ISR (Incremental Static Regeneration):** Pages cached for 60 seconds
- **Force Cache:** Static assets cached indefinitely
- **Dynamic Routes:** Article/category pages pre-rendered
- **Image Optimization:** Next.js automatic image optimization
- **Font Optimization:** Google Fonts with `display=swap`

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify backend API is returning correct tenant data
3. Test API endpoint manually with curl
4. Check browser console for errors
5. Verify DNS propagation completed

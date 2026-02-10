# Sitemap Quick Reference

## 🚀 Quick Start

Your news website now has a **professional 3-sitemap architecture** optimized for Google News.

---

## 📍 URLs

| Sitemap | URL | Purpose |
|---------|-----|---------|
| **Index** | `https://yourdomain.com/sitemap-index.xml` | Master index (submit this to Google) |
| **Static** | `https://yourdomain.com/sitemap.xml` | Static pages only |
| **News** | `https://yourdomain.com/sitemap-news.xml` | All articles |
| **Robots** | `https://yourdomain.com/robots.txt` | Points to sitemap-index.xml |

---

## ✅ Submit to Google Search Console

1. Go to: https://search.google.com/search-console
2. Select your property
3. Navigate to: **Sitemaps** (left sidebar)
4. Enter: `sitemap-index.xml`
5. Click **Submit**
6. Wait 24-48 hours for processing

---

## 🧪 Test Your Sitemaps

### **Quick Test:**
```bash
# Check index
curl https://yourdomain.com/sitemap-index.xml

# Check static pages
curl https://yourdomain.com/sitemap.xml

# Check news articles
curl https://yourdomain.com/sitemap-news.xml

# Check robots.txt
curl https://yourdomain.com/robots.txt
```

### **Validate XML:**
Visit: https://www.xml-sitemaps.com/validate-xml-sitemap.html

---

## 📊 What's Included

### **sitemap.xml (Static):**
- Homepage (/)
- About Us
- Contact
- Privacy Policy
- Terms & Conditions
- Editorial Policy
- AI Policy
- Corrections
- Our Team
- Other legal pages

**Total:** ~15 URLs
**Update:** Hourly revalidation
**Priority:** 0.5 - 1.0

### **sitemap-news.xml (Articles):**
- All published news articles
- Fetched from `/public/articles` API
- Up to 1,000 articles per sitemap
- Sorted by published date (newest first)

**Total:** Dynamic (based on article count)
**Update:** 30-minute revalidation
**Priority:** 0.7 - 0.9 (based on age)
**Changefreq:** hourly/daily/weekly (based on age)

---

## 🔧 Configuration

### **File Locations:**
```
app/
├── sitemap-index.xml/route.ts  → Master index
├── sitemap.xml/route.ts        → Static pages
├── sitemap-news.xml/route.ts   → News articles
└── robots.txt/route.ts         → Robots file
```

### **Update Frequencies:**
```typescript
sitemap-index.xml  → revalidate: 3600  (1 hour)
sitemap.xml        → revalidate: 3600  (1 hour)
sitemap-news.xml   → revalidate: 1800  (30 min)
```

### **Caching:**
```typescript
sitemap-index.xml  → max-age: 3600  (1 hour)
sitemap.xml        → max-age: 3600  (1 hour)
sitemap-news.xml   → max-age: 1800  (30 min)
```

---

## 🎯 Google News Optimization

### **Implemented Best Practices:**
- ✅ Separate static and dynamic content
- ✅ Accurate `lastmod` timestamps
- ✅ High priority for fresh articles (0.9)
- ✅ Frequent changefreq for new content (hourly)
- ✅ Clean, SEO-friendly URLs (no query params)
- ✅ Proper XML escaping
- ✅ Safe error handling
- ✅ Fast response times

### **Article Priority Logic:**
```typescript
< 7 days old   → priority: 0.9, changefreq: hourly
7-30 days old  → priority: 0.8, changefreq: daily
> 30 days old  → priority: 0.7, changefreq: weekly
```

---

## 🔍 Monitoring

### **Google Search Console:**
1. Check **Coverage** report weekly
2. Monitor **Sitemap** status
3. Watch for crawl errors
4. Review indexed URL count

### **What to Look For:**
- ✅ All sitemaps showing "Success"
- ✅ Increasing indexed URL count
- ✅ No errors or warnings
- ✅ Fresh articles being discovered quickly

### **Expected Timeline:**
- **Sitemap submission:** Instant
- **Initial processing:** 24-48 hours
- **Fresh article indexing:** 30 min - 2 hours
- **Full site indexing:** 1-2 weeks

---

## 🚨 Troubleshooting

### **Issue: "Couldn't fetch" error**
**Solution:** 
- Verify sitemap URLs load in browser
- Check server is responding (200 OK)
- Ensure valid XML format

### **Issue: "Sitemap is HTML"**
**Solution:**
- Check Content-Type header: `application/xml`
- Verify no middleware is intercepting

### **Issue: No articles in sitemap-news.xml**
**Solution:**
- Check API is returning articles
- Look at console logs for errors
- Test: `curl https://yourdomain.com/sitemap-news.xml`

### **Issue: Duplicate URLs**
**Solution:**
- Ensure articles ONLY in sitemap-news.xml
- Keep static pages ONLY in sitemap.xml
- No overlapping URLs

---

## 📈 Performance Tips

### **High-Frequency Publishing (>10 articles/hour):**
```typescript
// In sitemap-news.xml/route.ts
export const revalidate = 900  // 15 minutes
```

### **Low-Frequency Publishing (<5 articles/day):**
```typescript
// In sitemap-news.xml/route.ts
export const revalidate = 3600  // 1 hour
```

### **Large Article Count (>1,000):**
Consider pagination or multiple news sitemaps:
- sitemap-news-1.xml (articles 1-1000)
- sitemap-news-2.xml (articles 1001-2000)
- Update sitemap-index.xml to reference both

---

## 🎉 Success Indicators

After 1-2 weeks, you should see:
- ✅ 95%+ of URLs indexed
- ✅ Fresh articles appearing in search within hours
- ✅ No sitemap errors in Search Console
- ✅ Articles appearing in Google News
- ✅ Rich snippets in search results
- ✅ Improved organic traffic

---

## 📚 Full Documentation

For complete details, see:
- **[SITEMAP-ARCHITECTURE-NEWS.md](./SITEMAP-ARCHITECTURE-NEWS.md)**

---

## 🔗 Useful Links

- **Google Search Console:** https://search.google.com/search-console
- **Sitemap Validator:** https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Rich Results Test:** https://search.google.com/test/rich-results
- **Google News Publisher Center:** https://publishercenter.google.com

---

## ✅ Deployment Checklist

- [ ] All three sitemap routes deployed
- [ ] robots.txt updated
- [ ] Test all URLs return valid XML
- [ ] Submit sitemap-index.xml to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Monitor for 48 hours
- [ ] Check indexed URL count
- [ ] Verify article discovery works
- [ ] Test on all domains (if multi-tenant)
- [ ] Set up monitoring alerts

---

**Your Telugu news website is now optimized for maximum Google News visibility! 🚀**

**Next:** Submit `sitemap-index.xml` to Google Search Console and monitor your indexing progress.

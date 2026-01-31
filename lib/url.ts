export function basePathForTenant(tenantSlug: string) {
  const mode = process.env.MULTITENANT_MODE || 'path'
  return mode === 'path' ? `/t/${tenantSlug}` : ''
}

export function homeHref(tenantSlug: string) {
  const base = basePathForTenant(tenantSlug)
  return base || '/'
}

export function categoryHref(tenantSlug: string, slug: string) {
  return `${basePathForTenant(tenantSlug)}/category/${slug}`
}

/**
 * Generate SEO-friendly article URL
 * 
 * Format: /{categorySlug}/{articleSlug} (Always SEO-optimized!)
 * 
 * @param tenantSlug - Tenant identifier
 * @param slug - Article slug
 * @param categorySlug - Category slug (defaults to 'news' if not provided)
 */
export function articleHref(tenantSlug: string, slug: string, categorySlug?: string | null) {
  const base = basePathForTenant(tenantSlug)
  
  // 🚀 Always use SEO-friendly URL: /{categorySlug}/{articleSlug}
  // Default to 'news' category if not provided
  const category = categorySlug || 'news'
  
  if (base) {
    // Path mode: /t/{tenant}/{category}/{article}
    return `${base}/${category}/${slug}`
  }
  // Domain mode: /{category}/{article}
  return `/${category}/${slug}`
}

/**
 * Helper to extract category slug from Article object
 */
export function getCategorySlugFromArticle(article: {
  category?: { slug?: string } | null
  categories?: Array<{ slug?: string }> | null
}): string | undefined {
  return article.category?.slug || article.categories?.[0]?.slug || undefined
}

/**
 * Generate article URL with automatic category extraction
 * 
 * @param tenantSlug - Tenant identifier
 * @param article - Article object with category info
 */
export function articleHrefFromArticle(
  tenantSlug: string, 
  article: { 
    id: string
    slug?: string
    category?: { slug?: string } | null
    categories?: Array<{ slug?: string }> | null 
  }
): string {
  const categorySlug = getCategorySlugFromArticle(article)
  return articleHref(tenantSlug, article.slug || article.id, categorySlug)
}

/**
 * Generate SEO-friendly article URL with category
 * Best for search engine optimization!
 * 
 * @param tenantSlug - Tenant identifier  
 * @param categorySlug - Category slug (e.g., 'news', 'crime', 'entertainment')
 * @param articleSlug - Article slug
 */
export function seoArticleHref(tenantSlug: string, categorySlug: string, articleSlug: string) {
  const base = basePathForTenant(tenantSlug)
  
  // Domain mode: /category/article-slug
  if (!base) {
    return `/${categorySlug}/${articleSlug}`
  }
  
  // Path mode: /t/tenant/category/article-slug
  return `${base}/${categorySlug}/${articleSlug}`
}

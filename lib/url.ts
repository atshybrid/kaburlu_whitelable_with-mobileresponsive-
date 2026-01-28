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
 * Generate article URL - supports both simple and SEO-friendly formats
 * 
 * Simple format: /article/[slug]
 * SEO format:    /[category]/[slug] (better for SEO!)
 * 
 * @param tenantSlug - Tenant identifier
 * @param slug - Article slug
 * @param categorySlug - Optional category slug for SEO-friendly URL
 */
export function articleHref(tenantSlug: string, slug: string, categorySlug?: string) {
  const base = basePathForTenant(tenantSlug)
  
  // If category is provided and we're in domain mode, use SEO-friendly URL
  if (categorySlug && !base) {
    return `/${categorySlug}/${slug}`
  }
  
  // Fallback to simple article URL
  return `${base}/article/${slug}`
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

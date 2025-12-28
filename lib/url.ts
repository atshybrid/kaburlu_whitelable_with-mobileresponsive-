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

export function articleHref(tenantSlug: string, slug: string) {
  return `${basePathForTenant(tenantSlug)}/article/${slug}`
}

/**
 * Legacy Article Page - REDIRECT ONLY
 * 
 * URL: /article/[slug] → REDIRECTS to /{categorySlug}/{slug}
 * 
 * ⚠️ This route is DEPRECATED
 * All traffic is redirected to SEO-friendly URL format
 */

import { getArticleBySlug } from '@/lib/data'
import { resolveTenant } from '@/lib/tenant'
import { DomainNotLinked, TechnicalIssues } from '@/components/shared'
import { notFound, redirect } from 'next/navigation'

// Force dynamic rendering for domain-based multitenancy
export const dynamic = 'force-dynamic'
export const revalidate = 0

// No metadata needed - this route just redirects

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Resolve tenant from domain header
  const tenant = await resolveTenant()
  
  // Handle domain not linked case
  if (tenant.isDomainNotLinked) {
    return <DomainNotLinked domain={tenant.domain || 'unknown'} />
  }
  
  // Handle API error case
  if (tenant.isApiError) {
    return (
      <TechnicalIssues 
        title="Technical Issues"
        message="We're experiencing technical difficulties with our API services. Please contact Kaburlu Media support."
      />
    )
  }
  
  // Fetch article to get its category
  const article = await getArticleBySlug(tenant.id, slug)
  if (!article) return notFound()

  // 🚀 ALWAYS REDIRECT to SEO-friendly URL
  // /article/slug → /{categorySlug}/{slug}
  const categorySlug = article.category?.slug || article.categories?.[0]?.slug || 'news'
  
  // Permanent redirect (301) to SEO-friendly URL
  redirect(`/${categorySlug}/${slug}`)
}
import { getConfig } from '@/lib/config'

/**
 * JSON-LD Structured Data Generator
 * 
 * Generates rich structured data (Schema.org) for better SEO and rich snippets.
 * Includes:
 * - Organization schema
 * - Website schema
 * - NewsMediaOrganization schema
 * - SearchAction schema
 */
export async function StructuredData() {
  const config = await getConfig()
  
  if (!config) {
    return null
  }
  
  const baseUrl = config.domain.baseUrl
  const siteName = config.branding.siteName
  const description = config.seo.meta.description
  const logo = config.branding.logoUrl || config.branding.logo
  
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: siteName,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    description: description,
    sameAs: [
      config.social.facebook,
      config.social.twitter,
      config.social.instagram,
      config.social.youtube,
      config.social.telegram,
      config.social.linkedin,
    ].filter(Boolean),
  }
  
  // Website Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    description: description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
  
  // Breadcrumb List for homepage
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
    ],
  }
  
  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      
      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  )
}

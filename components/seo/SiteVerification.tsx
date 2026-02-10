import { getConfig } from '@/lib/config'

/**
 * Site Verification Meta Tags
 * 
 * Injects verification meta tags for:
 * - Google Search Console
 * - Bing Webmaster Tools
 * 
 * These tags are used to verify site ownership for search engine tools.
 */
export async function SiteVerification() {
  const config = await getConfig()
  
  if (!config?.integrations.verification) {
    return null
  }
  
  const { googleSiteVerification, bingSiteVerification } = config.integrations.verification
  
  return (
    <>
      {/* Google Search Console Verification */}
      {googleSiteVerification && (
        <meta name="google-site-verification" content={googleSiteVerification} />
      )}
      
      {/* Bing Webmaster Tools Verification */}
      {bingSiteVerification && (
        <meta name="msvalidate.01" content={bingSiteVerification} />
      )}
    </>
  )
}

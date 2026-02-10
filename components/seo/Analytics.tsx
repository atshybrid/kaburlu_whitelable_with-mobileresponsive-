import Script from 'next/script'
import { getConfig } from '@/lib/config'

/**
 * Google Analytics & Tag Manager Integration
 * 
 * Dynamically loads Google Analytics (GA4) and Google Tag Manager (GTM)
 * based on tenant configuration from the config API.
 * 
 * Features:
 * - Auto-inject GA4 tracking code
 * - Auto-inject GTM container code
 * - Privacy-aware loading
 * - Performance optimized with Next.js Script component
 */
export async function Analytics() {
  const config = await getConfig()
  
  if (!config?.integrations.analytics.enabled) {
    return null
  }
  
  const { googleAnalytics, googleTagManager } = config.integrations.analytics
  
  return (
    <>
      {/* Google Analytics (GA4) */}
      {googleAnalytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalytics}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalytics}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
      
      {/* Google Tag Manager */}
      {googleTagManager && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagManager}');
            `}
          </Script>
          
          {/* GTM NoScript Fallback */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManager}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
      
      {/* Google Ads Conversion Tracking */}
      {config.integrations.ads.googleAdsConversionId && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${config.integrations.ads.googleAdsConversionId}`}
          strategy="afterInteractive"
        />
      )}
    </>
  )
}

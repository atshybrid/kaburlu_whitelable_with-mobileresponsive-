import Script from 'next/script'
import { getConfig, getGa4MeasurementId, getGoogleTagManagerId } from '@/lib/config'

/**
 * Google Analytics (GA4 direct) — domain-specific measurement ID from /public/config.
 * GTM is skipped when provider is `ga4`; legacy tenants with only googleTagManager still work.
 */
export async function Analytics() {
  const config = await getConfig()

  if (!config?.integrations.analytics.enabled) {
    return null
  }

  const measurementId = getGa4MeasurementId(config)
  const googleTagManager = getGoogleTagManagerId(config)

  return (
    <>
      {measurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

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

      {config.integrations.ads.googleAdsConversionId && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${config.integrations.ads.googleAdsConversionId}`}
          strategy="afterInteractive"
        />
      )}
    </>
  )
}

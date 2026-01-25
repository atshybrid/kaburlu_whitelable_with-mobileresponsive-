/**
 * 🎯 Config-based Theme & Script Loader
 * 
 * Loads theme colors, analytics, ads, and other integrations
 * based on /public/config API response
 */

import { getConfig, getThemeCssVars } from '@/lib/config'
import Script from 'next/script'

export async function ConfigBasedScripts() {
  const config = await getConfig()
  
  if (!config) {
    return null
  }

  const gaId = config.integrations.analytics.googleAnalytics
  const gtmId = config.integrations.analytics.googleTagManager
  const adsenseId = config.integrations.ads.adsense

  return (
    <>
      {/* Google Analytics */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google AdSense */}
      {adsenseId && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  )
}

export async function ThemeColorVars() {
  const config = await getConfig()
  
  if (!config) {
    return null
  }

  const vars = getThemeCssVars(config)

  if (Object.keys(vars).length === 0) {
    return null
  }

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          ${Object.entries(vars).map(([key, value]) => `${key}: ${value};`).join('\n          ')}
        }
      `
    }} />
  )
}

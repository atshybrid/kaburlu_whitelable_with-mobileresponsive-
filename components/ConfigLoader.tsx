/**
 * 🎯 Config-based Theme & Script Loader
 *
 * Loads theme colors, analytics, ads, and other integrations
 * based on /public/config API response
 */

import { getConfig, getGa4MeasurementId, getGoogleTagManagerId, getThemeCssVars } from '@/lib/config'
import Script from 'next/script'

export async function ConfigBasedScripts() {
  const config = await getConfig()

  if (!config) {
    return null
  }

  const measurementId = getGa4MeasurementId(config)
  const gtmId = getGoogleTagManagerId(config)
  const adsenseId = config.integrations.ads.adsense

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
              gtag('config', '${measurementId}');
            `}
          </Script>
        </>
      )}

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

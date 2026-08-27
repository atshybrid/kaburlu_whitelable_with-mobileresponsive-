import Script from 'next/script'
import { getConfig, getGooglePublisher } from '@/lib/config'

/**
 * Subscribe with Google (SWG Basic) for Google Publisher Center.
 * Requires integrations.googlePublisher in /public/config (backend must expose).
 */
export async function SubscribeWithGoogle() {
  const config = await getConfig()
  const pub = getGooglePublisher(config)

  if (!pub?.subscribeWithGoogleProductId) {
    return null
  }

  const productId = pub.subscribeWithGoogleProductId
  const theme = pub.swgTheme || 'light'
  const lang = pub.swgLang || config?.content?.defaultLanguage || 'te'

  const initConfig = JSON.stringify({
    type: 'NewsArticle',
    isPartOfType: ['Product'],
    isPartOfProductId: productId,
    clientOptions: { theme, lang },
  })

  return (
    <>
      <Script
        src="https://news.google.com/swg/js/v1/swg-basic.js"
        strategy="afterInteractive"
      />
      <Script id="subscribe-with-google" strategy="afterInteractive">
        {`(self.SWG_BASIC = self.SWG_BASIC || []).push((basicSubscriptions) => {
          basicSubscriptions.init(${initConfig});
        });`}
      </Script>
    </>
  )
}

import type { Metadata } from "next";
import Script from 'next/script';
import { getEffectiveSettings } from "@/lib/settings";
import { getConfig, getDefaultLanguage, getDefaultLanguageDirection } from "@/lib/config";
import { getSEOHomepage, generateJSONLD } from "@/lib/seo";
import { ThemeColorVars } from "@/components/ConfigLoader";
import { Analytics, SiteVerification, StructuredData, WebPushManager } from "@/components/seo";
import "./globals.css";
import { OfflineDetector } from "@/components/shared/OfflineDetector";
// Load theme styles globally so root pages can apply theme-specific classes
import "@/themes/style1/theme.css";
import "@/themes/style2/theme.css";
import "@/themes/style3/theme.css";
import "@/themes/tv9/theme.css";
import "@/themes/toi/theme.css";

// Import Google Fonts for multi-language support
import { 
  Inter, 
  Noto_Sans_Telugu,
  Noto_Serif_Telugu,
  Noto_Sans_Devanagari, 
  Noto_Sans_Tamil,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Bengali,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Oriya,
  Noto_Nastaliq_Urdu,
  Merriweather,
  Playfair_Display
} from 'next/font/google';

// English/Default fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({ 
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

// Telugu - Sans for body text
const notoSansTelugu = Noto_Sans_Telugu({
  weight: ['400', '500', '600', '700'],
  subsets: ['telugu'],
  variable: '--font-telugu-sans',
  display: 'swap',
});

// Telugu - Serif for headlines
const notoSerifTelugu = Noto_Serif_Telugu({
  weight: ['600', '700'],
  subsets: ['telugu'],
  variable: '--font-telugu-serif',
  display: 'swap',
});

// Hindi/Devanagari (also for Marathi)
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
});

// Tamil
const notoSansTamil = Noto_Sans_Tamil({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['tamil'],
  variable: '--font-tamil',
  display: 'swap',
});

// Kannada
const notoSansKannada = Noto_Sans_Kannada({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['kannada'],
  variable: '--font-kannada',
  display: 'swap',
});

// Malayalam
const notoSansMalayalam = Noto_Sans_Malayalam({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['malayalam'],
  variable: '--font-malayalam',
  display: 'swap',
});

// Bengali
const notoSansBengali = Noto_Sans_Bengali({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['bengali'],
  variable: '--font-bengali',
  display: 'swap',
});

// Gujarati
const notoSansGujarati = Noto_Sans_Gujarati({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['gujarati'],
  variable: '--font-gujarati',
  display: 'swap',
});

// Punjabi/Gurmukhi
const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['gurmukhi'],
  variable: '--font-gurmukhi',
  display: 'swap',
});

// Odia
const notoSansOriya = Noto_Sans_Oriya({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['oriya'],
  variable: '--font-oriya',
  display: 'swap',
});

// Urdu
const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-urdu',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    // 🎯 PRIMARY: Use /public/config API v2.0 (SINGLE SOURCE OF TRUTH)
    const config = await getConfig()
    
    if (config) {
      return {
        title: config.seo.meta.title,
        description: config.seo.meta.description,
        keywords: config.seo.meta.keywords || undefined,
        openGraph: {
          title: config.seo.openGraph.title,
          description: config.seo.openGraph.description,
          url: config.seo.openGraph.url,
          siteName: config.seo.openGraph.siteName,
          images: config.seo.openGraph.imageUrl ? [{ url: config.seo.openGraph.imageUrl }] : undefined,
          type: 'website',
        },
        twitter: {
          card: config.seo.twitter.card,
          title: config.seo.twitter.title,
          description: config.seo.twitter.description,
          images: config.seo.twitter.imageUrl ? [config.seo.twitter.imageUrl] : undefined,
          creator: config.seo.twitter.handle || undefined,
        },
        icons: {
          icon: config.branding.favicon ? [{ url: config.branding.favicon }] : undefined,
          shortcut: config.branding.favicon ? [{ url: config.branding.favicon }] : undefined,
          apple: config.branding.appleTouchIcon || config.branding.logo ? [{ url: config.branding.appleTouchIcon || config.branding.logo }] : undefined,
        },
        robots: {
          index: true,
          follow: true,
        },
      }
    }

    // FALLBACK: Legacy settings API
    const s = await getEffectiveSettings()
    const title = s?.settings?.seo?.defaultMetaTitle || s?.seo?.defaultMetaTitle || process.env.SITE_NAME || 'Kaburlu News'
    const description = s?.settings?.seo?.defaultMetaDescription || s?.seo?.defaultMetaDescription || process.env.SITE_DESCRIPTION || 'Multi-tenant news platform'
    const ogImage = s?.settings?.seo?.ogImageUrl || s?.seo?.ogImageUrl
    const faviconUrl = s?.branding?.faviconUrl || s?.settings?.branding?.faviconUrl
    const icons = faviconUrl ? { icon: [{ url: faviconUrl }] } : { icon: [{ url: '/favicon.ico' }] }
    return {
      title,
      description,
      openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
      icons,
    }
  } catch {
    return {
      title: process.env.SITE_NAME || 'Kaburlu News',
      description: process.env.SITE_DESCRIPTION || 'Multi-tenant news platform',
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootLayoutInner>{children}</RootLayoutInner>
  );
}

async function RootLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🎯 API FLOW v2.0: 1) config → 2) seo/homepage → 3) categories
  const config = await getConfig()
  const seoData = await getSEOHomepage()
  
  let languageCode = 'te'
  let langDirection: 'ltr' | 'rtl' = 'ltr'
  
  if (config) {
    languageCode = getDefaultLanguage(config)
    langDirection = getDefaultLanguageDirection(config)
  } else {
    // FALLBACK: Legacy settings API
    try {
      const s = await getEffectiveSettings()
      const languageCodeRaw = String(
        s?.content?.defaultLanguage || s?.settings?.content?.defaultLanguage || 'te'
      ).toLowerCase()
      languageCode = (languageCodeRaw === 'telugu' ? 'te' : languageCodeRaw.split('-')[0]) || 'te'
    } catch {
      // ignore
    }
  }

  // Build font class string based on language
  const fontClasses = [
    inter.variable,
    merriweather.variable,
    playfair.variable,
    notoSansTelugu.variable,
    notoSerifTelugu.variable,
    notoSansDevanagari.variable,
    notoSansTamil.variable,
    notoSansKannada.variable,
    notoSansMalayalam.variable,
    notoSansBengali.variable,
    notoSansGujarati.variable,
    notoSansGurmukhi.variable,
    notoSansOriya.variable,
    notoNastaliqUrdu.variable,
  ].join(' ');

  const pushConfig = config?.integrations?.push
  // webPushVapidPublicKey is the preferred field; vapidPublicKey is the fallback
  const vapidKey = pushConfig?.webPushVapidPublicKey || pushConfig?.vapidPublicKey || null
  const isPushEnabled = Boolean(
    config?.features?.pwaPushNotifications &&
      pushConfig?.enabled &&
      vapidKey
  )

  // AdSense: accept both field names backend may send
  const adsConfig = config?.integrations?.ads
  const adsenseClient =
    adsConfig?.adsense ||
    ((adsConfig as Record<string, unknown>)?.adsenseClientId as string) ||
    null
  const adsEnabled = Boolean(adsConfig?.enabled && adsenseClient)

  return (
    <html lang={languageCode} dir={langDirection} data-lang={languageCode} className={fontClasses}>
      <head>
        {/* ✅ Prevent browser caching - force fresh data */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* � PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* �🔍 Site Verification for Google & Bing */}
        <SiteVerification />
        
        {/* 🎯 Dynamic theme colors from backend config */}
        <ThemeColorVars />
        
        {/* 📊 Structured Data (Schema.org JSON-LD) */}
        <StructuredData />
        
        {/* 🎯 JSON-LD structured data for Google (Schema.org) */}
        {seoData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: generateJSONLD(seoData) }}
          />
        )}
      </head>
      <body
        className={"antialiased"}
      >
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
        
        {/* 📈 Analytics & Tag Manager */}
        <Analytics />

        {/* 💰 AdSense Auto Ads — Google places ads automatically across the page */}
        {adsEnabled && adsenseClient && (
          <Script
            id="adsense-auto-ads"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}
            crossOrigin="anonymous"
          />
        )}

        <WebPushManager
          vapidPublicKey={vapidKey}
          fcmSenderId={pushConfig?.fcmSenderId || null}
          enabled={isPushEnabled}
        />
        
        {children}
        <OfflineDetector />
      </body>
    </html>
  );
}

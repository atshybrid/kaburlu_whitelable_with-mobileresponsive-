import type { Metadata } from "next";
import { getEffectiveSettings } from "@/lib/settings";
import { Geist, Geist_Mono } from "next/font/google";
import { Ramabhadra } from "next/font/google";
import { Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";
// Load theme styles globally so root pages can apply theme-specific classes
import "@/themes/style1/theme.css";
import "@/themes/style2/theme.css";
import "@/themes/style3/theme.css";
import "@/themes/tv9/theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ramabhadra = Ramabhadra({
  variable: "--font-ramabhadra",
  weight: "400",
  subsets: ["telugu"],
});

const notoSansTelugu = Noto_Sans_Telugu({
  variable: "--font-noto-sans-telugu",
  weight: ["400", "600", "700"],
  subsets: ["telugu"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
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
  // Keep layout sync unless we need tenant-specific language.
  // Note: RootLayout can be async in Next App Router.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused = children;
  return (
    <RootLayoutInner>{children}</RootLayoutInner>
  );
}

async function RootLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let languageCodeRaw = 'en'
  try {
    const s = await getEffectiveSettings()
    languageCodeRaw = String(
      s?.content?.defaultLanguage || s?.settings?.content?.defaultLanguage || 'en'
    ).toLowerCase()
  } catch {
    // ignore
  }

  const primaryLang = (languageCodeRaw === 'telugu' ? 'te' : languageCodeRaw.split('-')[0]) || 'en'
  const isTelugu = primaryLang === 'te'

  return (
    <html lang={primaryLang} data-lang={primaryLang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${isTelugu ? `${ramabhadra.variable} ${notoSansTelugu.variable}` : ''} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

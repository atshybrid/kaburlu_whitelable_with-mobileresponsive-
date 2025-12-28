import type { Metadata } from "next";
import { getEffectiveSettings } from "@/lib/settings";
import { Geist, Geist_Mono } from "next/font/google";
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

export async function generateMetadata(): Promise<Metadata> {
  try {
    const s = await getEffectiveSettings()
    const title = s?.settings?.seo?.defaultMetaTitle || s?.seo?.defaultMetaTitle || process.env.SITE_NAME || 'Kaburlu News'
    const description = s?.settings?.seo?.defaultMetaDescription || s?.seo?.defaultMetaDescription || process.env.SITE_DESCRIPTION || 'Multi-tenant news platform'
    const ogImage = s?.settings?.seo?.ogImageUrl || s?.seo?.ogImageUrl
    const icons = s?.branding?.faviconUrl ? { icon: [{ url: s.branding.faviconUrl }] } : undefined
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

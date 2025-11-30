"use client"
import Script from 'next/script'

export default function JsonLd({ data }: { data: any }) {
  if (!data) return null
  return (
    <Script
      id={Array.isArray(data) ? 'jsonld-multi' : 'jsonld'}
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify(data)}
    </Script>
  )
}

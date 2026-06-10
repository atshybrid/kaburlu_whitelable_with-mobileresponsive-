import { NextResponse } from 'next/server'

const APP_ADS_TXT = 'google.com, pub-5191460803448280, DIRECT, f08c47fec0942fa0\n'

/** AdSense app-ads.txt — required at /app-ads.txt for all tenant domains */
export async function GET() {
  return new NextResponse(APP_ADS_TXT, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

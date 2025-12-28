import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const pathname = url.pathname
  const mode = process.env.MULTITENANT_MODE || 'path'

  // Always pass the current pathname to server components via header
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  if (mode === 'subdomain') {
    const host = req.headers.get('host') || ''
    // localhost and ip: skip; use default tenant or path
    if (!host.startsWith('localhost')) {
      const parts = host.split('.')
      if (parts.length > 2) {
        const tenant = parts[0]
        // Rewrite subdomain to internal /t/[tenant] path
        const rewrite = new URL(`/t/${tenant}${pathname}`, req.url)
        return NextResponse.rewrite(rewrite, { request: { headers: requestHeaders } })
      }
    }
  }

  // In path mode we don't rewrite; ensure header is present
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}

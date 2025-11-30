// Removed next-pwa for Turbopack best-practice; manual SW registration is handled client-side.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'pub-b13a983e33694dbd96cd42158ce2147b.r2.dev', pathname: '/**' },
    ],
  },
  async rewrites() {
    const raw = process.env.BACKEND_ORIGIN || 'https://app.kaburlumedia.com/api/v1'
    // Normalize: if BACKEND_ORIGIN already contains '/api' (e.g., '/api' or '/api/v1'), don't append another '/api'
    const hasApi = /\/api(\b|\/)/.test(raw)
    const base = raw.replace(/\/$/, '')
    const destination = hasApi ? `${base}/:path*` : `${base}/api/:path*`
    return [
      { source: '/api/:path*', destination },
    ]
  },
  // Enable Turbopack config to silence Next 16 error when any webpack config is present via plugins
  turbopack: {},
}

module.exports = nextConfig

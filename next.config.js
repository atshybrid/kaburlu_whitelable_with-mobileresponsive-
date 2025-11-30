// Enable PWA only when explicitly requested via ENABLE_PWA=true
const isPWAEnabled = process.env.ENABLE_PWA === 'true'
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: !isPWAEnabled, // disabled by default to avoid noisy build logs
  fallbacks: { document: '/offline' },
})

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

// Ensure turbopack key remains on the final exported config even after plugin merges
const withPluginsApplied = withPWA(nextConfig)
module.exports = { ...withPluginsApplied, turbopack: withPluginsApplied.turbopack ?? {} }

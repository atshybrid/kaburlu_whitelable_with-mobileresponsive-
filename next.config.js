const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: { document: '/offline' },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // Enable Turbopack config to silence Next 16 error when any webpack config is present via plugins
  turbopack: {},
}

// Ensure turbopack key remains on the final exported config even after plugin merges
const withPluginsApplied = withPWA(nextConfig)
module.exports = { ...withPluginsApplied, turbopack: withPluginsApplied.turbopack ?? {} }

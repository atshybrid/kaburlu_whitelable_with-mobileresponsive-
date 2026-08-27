import type { Metadata } from 'next'

/**
 * Google Discover + rich results: allow large image previews in search/Discover.
 * @see https://developers.google.com/search/docs/appearance/google-discover
 */
export const discoverRobots: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}

/** Default OG image dimensions for Discover (min 1200px wide recommended). */
export const discoverOgImageSize = { width: 1200, height: 675 } as const

export function discoverOgImages(
  imageUrl: string | undefined,
  alt: string,
): NonNullable<Metadata['openGraph']>['images'] {
  if (!imageUrl) return []
  return [
    {
      url: imageUrl,
      width: discoverOgImageSize.width,
      height: discoverOgImageSize.height,
      alt,
      type: imageUrl.endsWith('.webp') ? 'image/webp' : undefined,
    },
  ]
}

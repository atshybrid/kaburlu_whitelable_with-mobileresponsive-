/**
 * Analytics & Conversion Tracking Utilities
 * 
 * Client-side utilities for tracking events, conversions, and user interactions
 * across Google Analytics, Google Tag Manager, and Google Ads.
 * 
 * Usage:
 * ```tsx
 * import { trackEvent, trackConversion, trackPageView } from '@/lib/analytics'
 * 
 * // Track custom event
 * trackEvent('article_read', { article_id: '123', category: 'news' })
 * 
 * // Track conversion
 * trackConversion('purchase', { value: 99.00, currency: 'USD' })
 * 
 * // Track page view (auto-tracked, but can be manual)
 * trackPageView('/article/breaking-news')
 * ```
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

/**
 * Track page view
 */
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
    })
  }
}

/**
 * Track conversion (Google Ads)
 */
export function trackConversion(
  conversionLabel: string,
  params?: {
    value?: number
    currency?: string
    transaction_id?: string
  }
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionLabel,
      ...params,
    })
  }
}

/**
 * Track article read
 */
export function trackArticleRead(articleId: string, category?: string) {
  trackEvent('article_read', {
    article_id: articleId,
    category: category,
    engagement_time: Date.now(),
  })
}

/**
 * Track article share
 */
export function trackArticleShare(
  articleId: string,
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'copy'
) {
  trackEvent('share', {
    method: platform,
    content_type: 'article',
    content_id: articleId,
  })
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount?: number) {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  })
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup() {
  trackEvent('newsletter_signup', {
    method: 'website',
  })
}

/**
 * Track contact form submission
 */
export function trackContactFormSubmit() {
  trackEvent('contact_form_submit', {
    form_type: 'contact',
  })
}

/**
 * Track video play
 */
export function trackVideoPlay(videoId: string, videoTitle?: string) {
  trackEvent('video_play', {
    video_id: videoId,
    video_title: videoTitle,
  })
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(percentage: number) {
  trackEvent('scroll', {
    percent_scrolled: percentage,
  })
}

/**
 * Track time on page
 */
export function trackTimeOnPage(seconds: number) {
  trackEvent('time_on_page', {
    time_seconds: seconds,
  })
}

/**
 * Custom GTM data layer push
 */
export function pushToDataLayer(data: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data)
  }
}

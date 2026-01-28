'use client'

import { GoogleAdSenseUnitClient } from './GoogleAdSenseUnitClient'

/**
 * Ad configuration from backend
 */
export interface SmartAdConfig {
  type: 'google' | 'local' | 'none'
  size?: string // "728x90" | "300x600" | "970x250" | "300x250"
  sticky?: boolean
  
  google?: {
    client: string
    slot: string
    format?: string
    responsive?: boolean
  }
  
  local?: {
    imageUrl: string
    clickUrl: string
    alt?: string
    logoUrl?: string
  }
}

/**
 * Smart Ad Component - Renders Google Ads, Local Ads, or Placeholder
 * 
 * Priority:
 * 1. Google Ad (if type="google" and google config exists)
 * 2. Local Ad (if type="local" and local config exists)
 * 3. Placeholder Banner (if type="none" or no valid config)
 */
export function SmartAd({
  config,
  variant = 'horizontal',
  className = '',
  showPlaceholder = true,
  label = 'Advertisement',
}: {
  config?: SmartAdConfig
  variant?: 'horizontal' | 'vertical' | 'square'
  className?: string
  showPlaceholder?: boolean
  label?: string
}) {
  // Get size dimensions
  const getSizeDimensions = () => {
    const size = config?.size || ''
    const [width, height] = size.split('x').map(Number)
    
    if (width && height) return { width, height }
    
    // Default sizes based on variant
    switch (variant) {
      case 'vertical':
        return { width: 300, height: 600 }
      case 'square':
        return { width: 300, height: 250 }
      case 'horizontal':
      default:
        return { width: 728, height: 90 }
    }
  }
  
  const dimensions = getSizeDimensions()
  
  // ═══════════════════════════════════════════════════════════════
  // 1. GOOGLE AD
  // ═══════════════════════════════════════════════════════════════
  if (config?.type === 'google' && config.google?.client && config.google?.slot) {
    return (
      <div className={`relative ${className}`} aria-label={label}>
        {/* Ad Label */}
        <div className="absolute top-1 right-1 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
          Ad
        </div>
        
        <GoogleAdSenseUnitClient
          client={config.google.client}
          slot={config.google.slot}
          format={config.google.format || 'auto'}
          responsive={config.google.responsive !== false}
        />
      </div>
    )
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 2. LOCAL AD (Banner/Image Ad)
  // ═══════════════════════════════════════════════════════════════
  if (config?.type === 'local' && config.local?.imageUrl) {
    return (
      <div className={`relative ${className}`} aria-label={label}>
        {/* Ad Label */}
        <div className="absolute top-1 right-1 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
          Ad
        </div>
        
        <a 
          href={config.local.clickUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={config.local.imageUrl} 
            alt={config.local.alt || label}
            className="w-full h-auto object-cover transition-transform hover:scale-[1.02]"
            style={{ maxHeight: dimensions.height }}
          />
        </a>
        
        {/* Advertiser Logo (optional) */}
        {config.local.logoUrl && (
          <div className="absolute bottom-2 left-2 bg-white/90 p-1 rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={config.local.logoUrl} alt="" className="h-4 w-auto" />
          </div>
        )}
      </div>
    )
  }
  
  // ═══════════════════════════════════════════════════════════════
  // 3. PLACEHOLDER BANNER (No Ad configured)
  // ═══════════════════════════════════════════════════════════════
  if (!showPlaceholder) return null
  
  return (
    <div 
      className={`relative flex items-center justify-center bg-gradient-to-br from-purple-500/80 to-indigo-600/80 rounded-lg ${className}`}
      style={{ minHeight: dimensions.height }}
      aria-label={label}
    >
      {/* Ad Label */}
      <div className="absolute top-1 right-1 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
        Ad
      </div>
      
      {/* Star Icon */}
      <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      
      {/* Size Label */}
      <div className="absolute bottom-2 text-center">
        <div className="text-white/90 text-sm font-medium">{label}</div>
        <div className="text-white/60 text-xs">{dimensions.width}×{dimensions.height}</div>
      </div>
    </div>
  )
}

/**
 * Horizontal Ad Banner - Commonly used sizes: 728x90, 970x250
 */
export function HorizontalSmartAd({ 
  config, 
  className = '' 
}: { 
  config?: SmartAdConfig
  className?: string 
}) {
  return (
    <div className={`w-full my-4 ${className}`}>
      <SmartAd 
        config={config} 
        variant="horizontal" 
        label="Advertisement"
      />
    </div>
  )
}

/**
 * Vertical/Sidebar Ad - Commonly used sizes: 300x600, 300x250
 */
export function SidebarSmartAd({ 
  config,
  sticky = false,
  className = '' 
}: { 
  config?: SmartAdConfig
  sticky?: boolean
  className?: string 
}) {
  return (
    <div className={`${sticky ? 'sticky top-20' : ''} ${className}`}>
      <SmartAd 
        config={config || { type: 'none', size: '300x600' }} 
        variant="vertical" 
        label="Advertisement"
      />
    </div>
  )
}

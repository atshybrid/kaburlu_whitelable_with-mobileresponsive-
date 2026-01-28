'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'

// Types
interface Milestone {
  value: number
  emoji: string
  color: string
  confettiCount: number
  label: string
}

interface LocaleMessages {
  congratulations: string
  reached: string
  views: string
  celebrate: string
  readers: string
}

interface CongratulationsConfig {
  enabled: boolean
  milestones: Milestone[]
  messages: Record<string, LocaleMessages>
  displayDuration: number
  autoClose: boolean
  showOncePerDay: boolean
  soundEnabled: boolean
  confettiColors: string[]
}

interface CongratulationsOverlayProps {
  viewCount: number
  tenantName: string
  locale?: string
  articleId?: string
}

interface ConfettiParticleData {
  id: number
  color: string
  delay: number
  left: number
  rotation: number
  isCircle: boolean
}

// Confetti particle component - receives all random values as props
function ConfettiParticle({ 
  color, 
  delay, 
  left,
  rotation,
  isCircle
}: ConfettiParticleData) {
  return (
    <div
      className="absolute w-3 h-3 opacity-0 animate-confetti"
      style={{
        backgroundColor: color,
        left: `${left}%`,
        animationDelay: `${delay}ms`,
        transform: `rotate(${rotation}deg)`,
        borderRadius: isCircle ? '50%' : '0',
      }}
    />
  )
}

// Format number with locale
function formatNumber(num: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale).format(num)
  } catch {
    return num.toLocaleString()
  }
}

// Check if milestone was shown today
function wasMilestoneShownToday(articleId: string, milestoneValue: number): boolean {
  if (typeof window === 'undefined') return true
  
  const storageKey = `milestone_${articleId}_${milestoneValue}`
  const lastShown = localStorage.getItem(storageKey)
  
  if (!lastShown) return false
  
  const lastShownDate = new Date(lastShown).toDateString()
  const today = new Date().toDateString()
  
  return lastShownDate === today
}

// Mark milestone as shown today
function markMilestoneShown(articleId: string, milestoneValue: number): void {
  if (typeof window === 'undefined') return
  
  const storageKey = `milestone_${articleId}_${milestoneValue}`
  localStorage.setItem(storageKey, new Date().toISOString())
}

// Find the milestone that was just reached
function findReachedMilestone(viewCount: number, milestones: Milestone[]): Milestone | null {
  // Sort milestones descending
  const sorted = [...milestones].sort((a, b) => b.value - a.value)
  
  for (const milestone of sorted) {
    // Check if we just crossed this milestone (within 10% margin or exact)
    if (viewCount >= milestone.value && viewCount < milestone.value * 1.1) {
      return milestone
    }
  }
  
  return null
}

// Generate confetti data outside of render
function generateConfettiData(count: number, colors: string[]): ConfettiParticleData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 1000,
    left: Math.random() * 100,
    rotation: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  }))
}

export function CongratulationsOverlay({
  viewCount,
  tenantName,
  locale = 'en',
  articleId = 'default'
}: CongratulationsOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [config, setConfig] = useState<CongratulationsConfig | null>(null)
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticleData[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasCheckedRef = useRef(false)
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load config on mount
  useEffect(() => {
    fetch('/congratulations.json')
      .then(res => res.json())
      .then((data: CongratulationsConfig) => setConfig(data))
      .catch(err => console.error('Failed to load congratulations config:', err))
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
    }
  }, [])

  // Check for milestone when config is loaded
  useEffect(() => {
    if (!config || !config.enabled || hasCheckedRef.current) return
    if (viewCount < 10) return // Minimum threshold
    
    hasCheckedRef.current = true
    
    const milestone = findReachedMilestone(viewCount, config.milestones)
    
    if (!milestone) return
    
    // Check if already shown today
    if (config.showOncePerDay && wasMilestoneShownToday(articleId, milestone.value)) {
      return
    }
    
    // Delay the celebration slightly to ensure page is rendered
    initTimeoutRef.current = setTimeout(() => {
      // Generate confetti data before showing
      const particles = generateConfettiData(milestone.confettiCount, config.confettiColors)
      setConfettiParticles(particles)
      setCurrentMilestone(milestone)
      setIsVisible(true)
      markMilestoneShown(articleId, milestone.value)
      
      // Play sound if enabled
      if (config.soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {})
      }
      
      // Auto close
      if (config.autoClose) {
        setTimeout(() => {
          setIsVisible(false)
        }, config.displayDuration)
      }
    }, 500)
  }, [config, viewCount, articleId])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  // Memoize messages
  const messages = useMemo(() => {
    return config?.messages[locale] || config?.messages['en'] || {
      congratulations: 'Congratulations!',
      reached: 'reached',
      views: 'views',
      celebrate: 'Celebrate your success!',
      readers: 'readers'
    }
  }, [config, locale])

  if (!isVisible || !currentMilestone || !config) return null

  return (
    <>
      {/* CSS Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti {
          0% {
            opacity: 1;
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }
        @keyframes celebrate-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(50px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        .animate-celebrate-bounce {
          animation: celebrate-bounce 0.6s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
      `}} />
      
      {/* Audio for celebration sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/celebration.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiParticles.map(particle => (
            <ConfettiParticle key={particle.id} {...particle} />
          ))}
        </div>
        
        {/* Main Card */}
        <div 
          className="relative mx-4 max-w-md w-full animate-slide-up"
          onClick={e => e.stopPropagation()}
        >
          {/* Pulse rings */}
          <div 
            className="absolute inset-0 rounded-3xl animate-pulse-ring"
            style={{ backgroundColor: currentMilestone.color, opacity: 0.3 }}
          />
          
          {/* Card content */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header with gradient */}
            <div 
              className="relative py-8 px-6 text-center text-white overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${currentMilestone.color}, ${currentMilestone.color}dd)`
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
              
              {/* Emoji */}
              <div className="text-6xl sm:text-7xl mb-4 animate-celebrate-bounce drop-shadow-lg">
                {currentMilestone.emoji}
              </div>
              
              {/* Congratulations text */}
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 drop-shadow-md">
                {messages.congratulations}
              </h2>
            </div>
            
            {/* Body */}
            <div className="py-8 px-6 text-center">
              {/* Tenant Name */}
              <div className="text-xl sm:text-2xl font-bold text-zinc-800 mb-3">
                {tenantName}
              </div>
              
              {/* Milestone reached */}
              <div className="text-zinc-600 mb-4">
                {messages.reached}
              </div>
              
              {/* View count - Big number */}
              <div 
                className="text-4xl sm:text-5xl font-black mb-2"
                style={{ color: currentMilestone.color }}
              >
                {formatNumber(currentMilestone.value, locale)}
              </div>
              
              <div className="text-xl text-zinc-700 font-semibold mb-4">
                {messages.views} / {messages.readers}
              </div>
              
              {/* Celebrate message */}
              <p className="text-zinc-500 text-sm mb-6">
                {messages.celebrate}
              </p>
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="px-8 py-3 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                style={{ backgroundColor: currentMilestone.color }}
              >
                🎊 OK
              </button>
            </div>
            
            {/* Badge */}
            <div 
              className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: currentMilestone.color }}
            >
              {currentMilestone.label}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Hook for easy integration
export function useCongratulations(viewCount: number, articleId?: string) {
  const [shouldShow, setShouldShow] = useState(false)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  
  useEffect(() => {
    if (viewCount < 10) return
    
    fetch('/congratulations.json')
      .then(res => res.json())
      .then((config: CongratulationsConfig) => {
        if (!config.enabled) return
        
        const reached = findReachedMilestone(viewCount, config.milestones)
        if (reached) {
          const id = articleId || 'default'
          if (!wasMilestoneShownToday(id, reached.value)) {
            setMilestone(reached)
            setShouldShow(true)
          }
        }
      })
      .catch(() => {})
  }, [viewCount, articleId])
  
  return { shouldShow, milestone }
}

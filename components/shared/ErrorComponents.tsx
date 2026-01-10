import type { ReactNode } from 'react'

// Component for when domain is not linked to Kaburlu Media
export function DomainNotLinked({ domain }: { domain?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        {/* Animated Building Icon */}
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <svg 
              className="w-24 h-24 text-blue-500"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/>
              <path d="M1 21h22"/>
              <path d="M9 7h1"/>
              <path d="M9 11h1"/>
              <path d="M9 15h1"/>
              <path d="M14 7h1"/>
              <path d="M14 11h1"/>
              <path d="M14 15h1"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            🚀 We&apos;re Building Something Amazing!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {domain ? `${domain}` : 'This website'} is coming soon.
          </p>
          <p className="text-gray-500">
            Our team is working hard to bring you a great experience.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Setup in Progress</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-1/3 animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500">
            Domain connected • Backend configuration pending
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Need Support?</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Contact <strong>Kaburlu Media</strong> team:</p>
            <div className="space-y-1">
              <p>📧 <a href="mailto:support@kaburlumedia.com" className="text-blue-600 hover:underline">support@kaburlumedia.com</a></p>
              <p>🌐 <a href="https://kaburlumedia.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">kaburlumedia.com</a></p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          <p>Powered by Kaburlu Media</p>
        </div>
      </div>
    </div>
  )
}

// Component for technical issues/API failures
export function TechnicalIssues({ 
  title = "Technical Issues", 
  message = "We're experiencing technical difficulties. Please try again later.",
  showContact = true,
  children
}: { 
  title?: string
  message?: string
  showContact?: boolean
  children?: ReactNode 
}) {
  return (
    <div className="min-h-[400px] bg-white flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-lg mx-auto">
        <div className="mb-8">
          <svg 
            className="mx-auto h-16 w-16 text-orange-500 mb-4"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="m12 17 .01 0"/>
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </div>

        {children}

        {showContact && (
          <div className="bg-gray-50 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Kaburlu Media</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="space-y-1">
                <p>📧 Email: <a href="mailto:support@kaburlumedia.com" className="text-blue-600 hover:underline">support@kaburlumedia.com</a></p>
                <p>📞 Phone: +1 (555) 123-4567</p>
                <p>🌐 Website: <a href="https://kaburlumedia.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">kaburlumedia.com</a></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Inline component for section errors (smaller, fits within layouts)
export function SectionError({ 
  title = "Unable to load content",
  className = ""
}: { 
  title?: string
  className?: string 
}) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
      <svg 
        className="mx-auto h-8 w-8 text-gray-400 mb-2"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4"/>
        <path d="m12 17 .01 0"/>
      </svg>
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className="text-xs text-gray-400">
        Technical issues from Kaburlu Media. Please contact support if this persists.
      </p>
    </div>
  )
}

// Component for empty data states (when API returns empty arrays)
export function EmptyState({ 
  title = "No content available",
  message = "Content will appear here when it becomes available.",
  className = ""
}: { 
  title?: string
  message?: string
  className?: string 
}) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
      <svg 
        className="mx-auto h-12 w-12 text-gray-300 mb-4"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
import type { ReactNode } from 'react'

// Component for when domain is not linked to Kaburlu Media
export function DomainNotLinked({ domain }: { domain?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <svg 
            className="mx-auto h-16 w-16 text-red-500 mb-4"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Not Linked</h1>
          <p className="text-gray-600">
            {domain ? `The domain "${domain}"` : 'This domain'} is not linked to Kaburlu Media platform.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Contact <strong>Kaburlu Media</strong> support team:</p>
            <div className="space-y-1">
              <p>📧 Email: <a href="mailto:support@kaburlumedia.com" className="text-blue-600 hover:underline">support@kaburlumedia.com</a></p>
              <p>📞 Phone: +1 (555) 123-4567</p>
              <p>🌐 Website: <a href="https://kaburlumedia.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">kaburlumedia.com</a></p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>If you&apos;re the website owner, please contact Kaburlu Media to set up your domain.</p>
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
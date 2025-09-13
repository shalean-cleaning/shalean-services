'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Cookie } from 'lucide-react'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent')
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3 flex-1">
            <Cookie className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">We use cookies to enhance your experience</p>
              <p>
                We use cookies to analyze site usage, personalize content, and improve our services. 
                By continuing to use our site, you consent to our use of cookies.{' '}
                <a href="/cookies" className="text-primary hover:underline">
                  Learn more
                </a>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="text-gray-600 hover:text-gray-800"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-primary hover:bg-primary/90"
            >
              Accept All
            </Button>
            <button
              onClick={handleDecline}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close cookie consent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

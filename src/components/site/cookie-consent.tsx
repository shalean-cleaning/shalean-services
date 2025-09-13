'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const handleManage = () => {
    // In a real app, this would open a cookie management modal
    console.log('Open cookie management')
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            We use cookies to enhance your experience and analyze site usage. 
            By continuing to browse, you consent to our use of cookies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleManage}>
            Manage
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAccept}
            className="p-1"
            aria-label="Close cookie notice"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Calculator, Plus, Minus } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatZAR } from '@/lib/format'

interface ServiceCategory {
  id: string
  name: string
  description?: string
  icon?: string
  sort_order: number
  services: ServiceItem[]
}

interface ServiceItem {
  id: string
  name: string
  description?: string
  base_price: number
  duration_minutes: number
  category_id: string
  sort_order: number
}

interface Service {
  id: string
  name: string
  description?: string
  base_price: number
  duration_minutes: number
  service_categories?: {
    id: string
    name: string
    description?: string
  }
}

interface Extra {
  id: string
  name: string
  description?: string
  price: number
  duration_minutes: number
}

interface Region {
  id: string
  name: string
  state: string
  suburbs: {
    id: string
    name: string
    postcode?: string
    delivery_fee: number
  }[]
}

interface QuoteBreakdown {
  base_price: number
  service_fee: number
  delivery_fee: number
  extras_total: number
  total: number
}

interface QuickQuoteProps {
  isModal?: boolean
  onContinueToBooking?: (quoteData: { service: Service; suburb: Region['suburbs'][0]; extras: Extra[]; total: number; breakdown: QuoteBreakdown }) => void
}

export default function QuickQuote({ isModal = false, onContinueToBooking }: QuickQuoteProps) {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [extras, setExtras] = useState<Extra[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Form state
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedSuburb, setSelectedSuburb] = useState<string>('')
  const [bedrooms, setBedrooms] = useState<string>('')
  const [bathrooms, setBathrooms] = useState<string>('')
  const [frequency, setFrequency] = useState<string>('one-time')
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({})
  const [email, setEmail] = useState<string>('')
  
  // Quote state
  const [quoteBreakdown, setQuoteBreakdown] = useState<QuoteBreakdown | null>(null)
  const [serviceName, setServiceName] = useState<string>('')
  const [suburbName, setSuburbName] = useState<string>('')


  // Fetch data on component mount
  useEffect(() => {
    setLoadError(null)
    ;(async () => {
      try {
        const [servicesRes, regionsRes] = await Promise.all([
          fetch('/api/services', { cache: 'no-store' }),
          fetch('/api/regions', { cache: 'no-store' })
        ])

        if (!servicesRes.ok) {
          let body = ''
          try { body = await servicesRes.text() } catch (e) { console.warn('[QuickQuote] services response read error:', e) }
          console.error('[QuickQuote] services response body:', body)
          console.error('[QuickQuote] services failed:', { url: '/api/services', status: servicesRes.status, statusText: servicesRes.statusText })
          throw new Error(`services failed with ${servicesRes.status} ${servicesRes.statusText}`)
        }

        if (!regionsRes.ok) {
          let body = ''
          try { body = await regionsRes.text() } catch (e) { console.warn('[QuickQuote] regions response read error:', e) }
          console.error('[QuickQuote] regions response body:', body)
          console.error('[QuickQuote] regions failed:', { url: '/api/regions', status: regionsRes.status, statusText: regionsRes.statusText })
          throw new Error(`regions failed with ${regionsRes.status} ${regionsRes.statusText}`)
        }

        const servicesData = await servicesRes.json()
        const regionsData = await regionsRes.json()

        setServiceCategories(servicesData.categories ?? [])
        setExtras(servicesData.extras ?? [])
        setRegions(regionsData ?? [])
      } catch (err: unknown) {
        console.error('[QuickQuote] bootstrap error:', err)
        setLoadError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    })()
  }, [])


  // Calculate quote when dependencies change
  const calculateQuote = useCallback(async () => {
    if (!selectedService || !selectedSuburb) return

    setCalculating(true)
    try {
      const extrasArray = Object.entries(selectedExtras)
        .filter(([, quantity]) => quantity > 0)
        .map(([extraId, quantity]) => {
          const extra = extras.find(e => e.id === extraId)
          return {
            id: extraId,
            quantity,
            price: extra?.price || 0
          }
        })

      const response = await fetch('/api/quote/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: selectedService,
          suburb_id: selectedSuburb,
          extras: extrasArray,
          bedrooms: parseInt(bedrooms) || 0,
          bathrooms: parseInt(bathrooms) || 0,
          frequency
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate quote')
      }

      const data = await response.json()
      setQuoteBreakdown(data.breakdown)
      setServiceName(data.service_name)
      setSuburbName(data.suburb_name)
    } catch (error) {
      console.error('Error calculating quote:', error)
    } finally {
      setCalculating(false)
    }
  }, [selectedService, selectedSuburb, selectedExtras, bedrooms, bathrooms, frequency, extras])

  // Debounced calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateQuote()
    }, 300)

    return () => clearTimeout(timer)
  }, [calculateQuote])

  const handleExtraQuantityChange = (extraId: string, change: number) => {
    setSelectedExtras(prev => ({
      ...prev,
      [extraId]: Math.max(0, (prev[extraId] || 0) + change)
    }))
  }

  const handleContinueToBooking = () => {
    // Store in localStorage for booking flow
    localStorage.setItem('quickQuote', JSON.stringify({
      service_id: selectedService,
      suburb_id: selectedSuburb,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      frequency,
      extras: Object.entries(selectedExtras)
        .filter(([, quantity]) => quantity > 0)
        .map(([extraId, quantity]) => ({
          id: extraId,
          quantity,
          price: extras.find(e => e.id === extraId)?.price || 0
        })),
      breakdown: quoteBreakdown,
      service_name: serviceName,
      suburb_name: suburbName,
      email
    }))
    
    if (onContinueToBooking) {
      // Find the selected service from categories
      let selectedServiceItem: ServiceItem | null = null
      for (const category of serviceCategories) {
        const service = category.services.find(service => service.id === selectedService)
        if (service) {
          selectedServiceItem = service
          break
        }
      }
      
      const region = regions.find(r => r.suburbs.some(s => s.id === selectedSuburb))
      const suburb = region?.suburbs.find(s => s.id === selectedSuburb)
      
      if (selectedServiceItem && suburb && quoteBreakdown) {
        // Convert ServiceItem to Service format for compatibility
        const service: Service = {
          id: selectedServiceItem.id,
          name: selectedServiceItem.name,
          base_price: selectedServiceItem.base_price,
          duration_minutes: selectedServiceItem.duration_minutes,
          service_categories: {
            id: selectedServiceItem.category_id,
            name: serviceCategories.find(c => c.id === selectedServiceItem!.category_id)?.name || '',
            description: serviceCategories.find(c => c.id === selectedServiceItem!.category_id)?.description
          }
        }
        
        onContinueToBooking({
          service,
          suburb,
          extras: Object.entries(selectedExtras)
            .filter(([, quantity]) => quantity > 0)
            .map(([extraId, quantity]) => {
              const extra = extras.find(e => e.id === extraId)
              return extra ? { ...extra, quantity } : null
            })
            .filter((extra): extra is Extra & { quantity: number } => extra !== null),
          total: quoteBreakdown.total,
          breakdown: quoteBreakdown
        })
      }
    } else {
      // Navigate to booking page
      window.location.href = '/booking'
    }
  }

  const handleEmailQuote = async () => {
    if (!email || !quoteBreakdown) return

    try {
      // Store quote in database for email follow-up
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          service_id: selectedService,
          suburb_id: selectedSuburb,
          bedrooms: parseInt(bedrooms) || 0,
          bathrooms: parseInt(bathrooms) || 0,
          frequency,
          extras: Object.entries(selectedExtras)
            .filter(([, quantity]) => quantity > 0)
            .map(([extraId, quantity]) => ({
              id: extraId,
              quantity,
              price: extras.find(e => e.id === extraId)?.price || 0
            })),
          total_price: quoteBreakdown.total
        })
      })

      if (response.ok) {
        alert('Quote sent to your email!')
      } else {
        throw new Error('Failed to send quote')
      }
    } catch (error) {
      console.error('Error sending quote:', error)
      alert('Failed to send quote. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const content = (
    <div className="space-y-6">
      {loadError && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm">
          {loadError} — check console for details.
        </div>
      )}

      {/* Service Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Type *
        </label>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories.map((category) => (
              <div key={category.id}>
                <div className="px-2 py-1 text-sm font-medium text-gray-500 bg-gray-50">
                  {category.name}
                </div>
                {category.services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-sm text-gray-500">${service.base_price} • {service.duration_minutes}min</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <Select value={selectedSuburb} onValueChange={setSelectedSuburb}>
          <SelectTrigger>
            <SelectValue placeholder="Select your suburb" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <div key={region.id}>
                <div className="px-2 py-1 text-sm font-medium text-gray-500 bg-gray-50">
                  {region.name}, {region.state}
                </div>
                {region.suburbs.map((suburb) => (
                  <SelectItem key={suburb.id} value={suburb.id}>
                    <div className="flex justify-between w-full">
                      <span>{suburb.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ${suburb.delivery_fee} delivery
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} bedroom{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <Select value={bathrooms} onValueChange={setBathrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Bathrooms" />
            </SelectTrigger>
            <SelectContent>
              {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} bathroom{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cleaning Frequency
        </label>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one-time">One-time</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Extras */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Services
        </label>
        <div className="space-y-3">
          {extras.map((extra) => (
            <div key={extra.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{extra.name}</div>
                {extra.description && (
                  <div className="text-sm text-gray-500">{extra.description}</div>
                )}
                <div className="text-sm text-primary font-medium">${extra.price}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtraQuantityChange(extra.id, -1)}
                  disabled={!selectedExtras[extra.id]}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center">
                  {selectedExtras[extra.id] || 0}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtraQuantityChange(extra.id, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email for Quote */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Quote Display */}
      {quoteBreakdown && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Your Quote
            </CardTitle>
            <CardDescription>
              {serviceName} • {suburbName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>{formatZAR(quoteBreakdown.base_price * 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee (10%)</span>
                <span>{formatZAR(quoteBreakdown.service_fee * 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatZAR(quoteBreakdown.delivery_fee * 100)}</span>
              </div>
              {quoteBreakdown.extras_total > 0 && (
                <div className="flex justify-between">
                  <span>Extras</span>
                  <span>{formatZAR(quoteBreakdown.extras_total * 100)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatZAR(quoteBreakdown.total * 100)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {email && quoteBreakdown && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleEmailQuote}
            disabled={calculating}
          >
            Email me this Quote
          </Button>
        )}
        <Button
          className="w-full"
          onClick={handleContinueToBooking}
          disabled={!quoteBreakdown || calculating}
        >
          Continue to Booking
        </Button>
      </div>

      {calculating && (
        <div className="text-center text-sm text-gray-500">
          Calculating your quote...
        </div>
      )}
    </div>
  )

  if (isModal) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Calculator className="w-4 h-4 mr-2" />
            Quick Quote
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Get Your Quick Quote</DialogTitle>
            <DialogDescription>
              Select your service preferences and get an instant price estimate.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Quick Quote
        </h1>
        <p className="text-lg text-gray-600">
          Get an instant price estimate for your cleaning service
        </p>
      </div>
      {content}
    </div>
  )
}

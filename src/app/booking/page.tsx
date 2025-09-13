'use client'

import { CheckCircle, Calendar, User, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface QuoteData {
  service_id: string
  suburb_id: string
  bedrooms: number
  bathrooms: number
  frequency: string
  extras: Array<{
    id: string
    quantity: number
    price: number
  }>
  breakdown: {
    base_price: number
    service_fee: number
    delivery_fee: number
    extras_total: number
    total: number
  }
  service_name: string
  suburb_name: string
  email: string
}

export default function BookingPage() {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    specialInstructions: '',
    paymentMethod: ''
  })

  useEffect(() => {
    // Load quote data from localStorage
    const savedQuote = localStorage.getItem('quickQuote')
    if (savedQuote) {
      try {
        const parsed = JSON.parse(savedQuote)
        setQuoteData(parsed)
        setFormData(prev => ({
          ...prev,
          email: parsed.email || ''
        }))
      } catch (error) {
        console.error('Error parsing quote data:', error)
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement actual booking creation
      console.log('Creating booking with data:', {
        ...formData,
        quoteData
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Clear localStorage and redirect to confirmation
      localStorage.removeItem('quickQuote')
      alert('Booking created successfully!')
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, title: 'Service Details', icon: CheckCircle },
    { id: 2, title: 'Contact Info', icon: User },
    { id: 3, title: 'Schedule', icon: Calendar },
    { id: 4, title: 'Payment', icon: CreditCard }
  ]

  if (!quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>No Quote Found</CardTitle>
            <CardDescription>
              Please start by getting a quote first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/quote'}
              className="w-full"
            >
              Get a Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">
            You&apos;re almost done! Just a few more details to confirm your cleaning service.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Steps */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Booking Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((stepItem) => {
                    const Icon = stepItem.icon
                    const isActive = step === stepItem.id
                    const isCompleted = step > stepItem.id
                    
                    return (
                      <div
                        key={stepItem.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          isActive ? 'bg-primary/10 text-primary' : 
                          isCompleted ? 'bg-green-50 text-green-700' : 
                          'text-gray-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{stepItem.title}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quote Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{quoteData.service_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{quoteData.suburb_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{quoteData.bedrooms} bed, {quoteData.bathrooms} bath</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency: {quoteData.frequency}</span>
                  </div>
                  {quoteData.extras.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm text-gray-600 mb-2">Extras:</div>
                      {quoteData.extras.map((extra, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{extra.quantity}x Extra</span>
                          <span>${(extra.price * extra.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${quoteData.breakdown.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Service Details */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                    <CardDescription>
                      Review your selected service and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Type
                          </label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            {quoteData.service_name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            {quoteData.suburb_name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Property Size
                          </label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            {quoteData.bedrooms} bedrooms, {quoteData.bathrooms} bathrooms
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequency
                          </label>
                          <div className="p-3 bg-gray-50 rounded-md">
                            {quoteData.frequency}
                          </div>
                        </div>
                      </div>

                      {quoteData.extras.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Services
                          </label>
                          <div className="space-y-2">
                            {quoteData.extras.map((extra, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-md">
                                {extra.quantity}x Extra Service - ${(extra.price * extra.quantity).toFixed(2)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Please provide your contact details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <Input
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="John"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <Input
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Address *
                        </label>
                        <Input
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="123 Main St, Suburb, State 12345"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Schedule */}
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Your Service</CardTitle>
                    <CardDescription>
                      Choose your preferred date and time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Date *
                        </label>
                        <Input
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time *
                        </label>
                        <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12:00 PM - 5:00 PM)</SelectItem>
                            <SelectItem value="evening">Evening (5:00 PM - 9:00 PM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions
                        </label>
                        <textarea
                          value={formData.specialInstructions}
                          onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Any special requests or instructions for our cleaners..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>
                      Choose your payment method.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method *
                        </label>
                        <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="cash">Cash on Service</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Amount</span>
                          <span className="text-2xl font-bold text-primary">
                            ${quoteData.breakdown.total.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Payment will be processed after service completion.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating Booking...' : 'Complete Booking'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

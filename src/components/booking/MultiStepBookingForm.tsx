'use client'

import { useState, useEffect } from 'react'
import { createDraftBooking, finalizeBooking, autoAssignCleaner } from '@/lib/booking-utils'
import { useAuth } from '@/hooks/useAuth'
import { Service, Region } from '@/lib/database.types'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface MultiStepBookingFormProps {
  onBookingCreated?: (bookingId: string) => void
}

interface FormData {
  // Step 1: Service
  service_id: string
  
  // Step 2: Rooms & Extras
  bedrooms: number
  bathrooms: number
  extras: string[]
  
  // Step 3: Location & Time
  region_id: string
  area_id: string
  booking_date: string
  start_time: string
  end_time: string
  address: string
  postcode: string
  
  // Step 4: Cleaner
  cleaner_id?: string
  auto_assign: boolean
  
  // Additional
  notes: string
}

interface FormErrors {
  [key: string]: string
}

const STEPS = [
  { id: 1, title: 'Service', description: 'Select your cleaning service' },
  { id: 2, title: 'Rooms & Extras', description: 'Specify bedrooms, bathrooms & extras' },
  { id: 3, title: 'Location & Time', description: 'Choose location and schedule' },
  { id: 4, title: 'Cleaner', description: 'Select your cleaner' }
]

export function MultiStepBookingForm({ onBookingCreated }: MultiStepBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isValid, setIsValid] = useState(false)

  // Data for dropdowns
  const [services, setServices] = useState<Service[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [cleaners, setCleaners] = useState<any[]>([])
  const [extras, setExtras] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const { user, loading: authLoading } = useAuth()

  // Form data
  const [formData, setFormData] = useState<FormData>({
    service_id: '',
    bedrooms: 1,
    bathrooms: 1,
    extras: [],
    region_id: '',
    area_id: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    address: '',
    postcode: '',
    cleaner_id: '',
    auto_assign: true,
    notes: ''
  })

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [servicesRes, regionsRes, extrasRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/regions'),
          fetch('/api/extras')
        ])

        if (servicesRes.ok && regionsRes.ok) {
          const [servicesData, regionsData, extrasData] = await Promise.all([
            servicesRes.json(),
            regionsRes.json(),
            extrasRes.ok ? extrasRes.json() : Promise.resolve([])
          ])
          setServices(servicesData.services || [])
          setRegions(regionsData || [])
          setExtras(extrasData || [])
        } else {
          console.error('Failed to fetch data:', { 
            servicesRes: servicesRes.status, 
            regionsRes: regionsRes.status,
            extrasRes: extrasRes.status 
          })
          setError('Failed to load form data')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load form data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch areas when region changes
  useEffect(() => {
    if (formData.region_id) {
      const fetchAreas = async () => {
        try {
          const response = await fetch(`/api/areas?region_id=${formData.region_id}`)
          if (response.ok) {
            const data = await response.json()
            setAreas(data || [])
          } else {
            console.error('Failed to fetch areas:', response.status)
            setAreas([])
          }
        } catch (err) {
          console.error('Error fetching areas:', err)
          setAreas([])
        }
      }
      fetchAreas()
    } else {
      setAreas([])
    }
  }, [formData.region_id])

  // Fetch cleaners when location and time are set
  useEffect(() => {
    if (formData.area_id && formData.booking_date && formData.start_time && formData.end_time) {
      const fetchCleaners = async () => {
        try {
          const response = await fetch(`/api/cleaners/available?area_id=${formData.area_id}&date=${formData.booking_date}&start_time=${formData.start_time}&end_time=${formData.end_time}`)
          if (response.ok) {
            const data = await response.json()
            setCleaners(data || [])
          } else {
            console.error('Failed to fetch cleaners:', response.status)
            setCleaners([])
          }
        } catch (err) {
          console.error('Error fetching cleaners:', err)
          setCleaners([])
        }
      }
      fetchCleaners()
    } else {
      setCleaners([])
    }
  }, [formData.area_id, formData.booking_date, formData.start_time, formData.end_time])

  // Validate current step
  useEffect(() => {
    const errors: FormErrors = {}
    
    switch (currentStep) {
      case 1: // Service
        if (!formData.service_id) errors.service_id = 'Please select a service'
        break
        
      case 2: // Rooms & Extras
        if (formData.bedrooms < 1) errors.bedrooms = 'At least 1 bedroom is required'
        if (formData.bathrooms < 1) errors.bathrooms = 'At least 1 bathroom is required'
        break
        
      case 3: // Location & Time
        if (!formData.region_id) errors.region_id = 'Please select a region'
        if (!formData.area_id) errors.area_id = 'Please select a suburb'
        if (!formData.booking_date) errors.booking_date = 'Please select a date'
        if (!formData.start_time) errors.start_time = 'Please select start time'
        if (!formData.end_time) errors.end_time = 'Please select end time'
        if (!formData.address.trim()) errors.address = 'Address is required'
        if (!formData.postcode.trim()) errors.postcode = 'Postcode is required'
        
        // Validate time logic
        if (formData.start_time && formData.end_time) {
          const start = new Date(`2000-01-01T${formData.start_time}`)
          const end = new Date(`2000-01-01T${formData.end_time}`)
          if (end <= start) {
            errors.end_time = 'End time must be after start time'
          }
        }
        break
        
      case 4: // Cleaner
        if (!formData.auto_assign && !formData.cleaner_id) {
          errors.cleaner_id = 'Please select a cleaner or enable auto-assign'
        }
        break
    }

    setFormErrors(errors)
    setIsValid(Object.keys(errors).length === 0)
  }, [formData, currentStep])

  const handleInputChange = (field: keyof FormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleExtraToggle = (extraId: string) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.includes(extraId)
        ? prev.extras.filter(id => id !== extraId)
        : [...prev.extras, extraId]
    }))
  }

  const nextStep = () => {
    if (isValid && currentStep < 4) {
      setCurrentStep(prev => prev + 1)
      setError(null)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    if (!isValid) return

    setLoading(true)
    setError(null)

    try {
      // Create draft booking
      const booking = await createDraftBooking({
        customer_id: user!.id,
        service_id: formData.service_id,
        area_id: formData.area_id,
        region_id: formData.region_id,
        booking_date: formData.booking_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes,
        auto_assign: formData.auto_assign
      })

      setBookingId(booking.id)

      // Finalize the booking with customer details
      await finalizeBooking(booking.id, {
        address: formData.address,
        postcode: formData.postcode,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms
      })

      // Assign cleaner if selected
      if (!formData.auto_assign && formData.cleaner_id) {
        // TODO: Implement manual cleaner assignment
        console.log('Manual cleaner assignment not yet implemented')
      } else if (formData.auto_assign) {
        await autoAssignCleaner(booking.id)
      }

      onBookingCreated?.(booking.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please log in to create a booking.</p>
        <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
          Go to Login
        </a>
      </div>
    )
  }

  if (authLoading || dataLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4
                  ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Select Your Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div
                  key={service.id}
                  className={`
                    border-2 rounded-lg p-4 cursor-pointer transition-all
                    ${formData.service_id === service.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleInputChange('service_id', service.id)}
                >
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  <p className="text-lg font-semibold text-blue-600 mt-2">
                    ${service.base_fee || 0}
                  </p>
                </div>
              ))}
            </div>
            {formErrors.service_id && (
              <p className="text-red-500 text-sm">{formErrors.service_id}</p>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Rooms & Extras</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
                  className={`w-full border rounded-lg px-3 py-2 ${formErrors.bedrooms ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.bedrooms && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.bedrooms}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                  className={`w-full border rounded-lg px-3 py-2 ${formErrors.bathrooms ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.bathrooms && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.bathrooms}</p>
                )}
              </div>
            </div>

            {extras.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {extras.map(extra => (
                    <div
                      key={extra.id}
                      className={`
                        border rounded-lg p-3 cursor-pointer transition-all
                        ${formData.extras.includes(extra.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => handleExtraToggle(extra.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{extra.name}</h4>
                          <p className="text-sm text-gray-600">{extra.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                          +${extra.price || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Location & Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={formData.region_id}
                  onChange={(e) => {
                    handleInputChange('region_id', e.target.value)
                    handleInputChange('area_id', '') // Reset suburb when region changes
                  }}
                  className={`w-full border rounded-lg px-3 py-2 ${formErrors.region_id ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select a region</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
                {formErrors.region_id && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.region_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suburb
                </label>
                <select
                  value={formData.area_id}
                  onChange={(e) => handleInputChange('area_id', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 ${formErrors.area_id ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={!formData.region_id}
                >
                  <option value="">Select a suburb</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} {area.postcode && `(${area.postcode})`}
                    </option>
                  ))}
                </select>
                {formErrors.area_id && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.area_id}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your full address"
              />
              {formErrors.address && (
                <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcode
              </label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${formErrors.postcode ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter postcode"
              />
              {formErrors.postcode && (
                <p className="text-red-500 text-sm mt-1">{formErrors.postcode}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.booking_date}
                  onChange={(e) => handleInputChange('booking_date', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 ${formErrors.booking_date ? 'border-red-500' : 'border-gray-300'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.booking_date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.booking_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 ${formErrors.start_time ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.start_time && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.start_time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 ${formErrors.end_time ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.end_time && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.end_time}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Any special instructions or notes..."
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Select Your Cleaner</h2>
            
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="auto_assign"
                checked={formData.auto_assign}
                onChange={(e) => handleInputChange('auto_assign', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="auto_assign" className="text-sm font-medium text-gray-700">
                Auto-assign cleaner (recommended)
              </label>
            </div>

            {!formData.auto_assign && (
              <div>
                {cleaners.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cleaners.map(cleaner => (
                      <div
                        key={cleaner.id}
                        className={`
                          border-2 rounded-lg p-4 cursor-pointer transition-all
                          ${formData.cleaner_id === cleaner.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        onClick={() => handleInputChange('cleaner_id', cleaner.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {cleaner.first_name?.[0]}{cleaner.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {cleaner.first_name} {cleaner.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {cleaner.rating ? `⭐ ${cleaner.rating}/5` : 'New cleaner'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {cleaner.completed_bookings || 0} bookings completed
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No cleaners available for the selected time slot.</p>
                    <p className="text-sm mt-2">Try selecting a different date or time.</p>
                  </div>
                )}
                {formErrors.cleaner_id && (
                  <p className="text-red-500 text-sm mt-2">{formErrors.cleaner_id}</p>
                )}
              </div>
            )}

            {formData.auto_assign && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  We'll automatically assign the best available cleaner for your selected time slot.
                  You'll receive confirmation with your cleaner's details once the booking is confirmed.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!isValid}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Booking...' : 'Complete Booking'}
          </button>
        )}
      </div>
    </div>
  )
}

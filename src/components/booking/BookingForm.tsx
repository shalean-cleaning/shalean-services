'use client'

import { useState, useEffect } from 'react'
import { createDraftBooking, finalizeBooking, autoAssignCleaner } from '@/lib/booking-utils'
import { useAuth } from '@/hooks/useAuth'
import { Service, Region, Suburb } from '@/lib/database.types'

interface BookingFormProps {
  onBookingCreated?: (bookingId: string) => void
}

interface FormData {
  service_id: string
  area_id: string
  region_id: string
  booking_date: string
  start_time: string
  end_time: string
  address: string
  postcode: string
  bedrooms: number
  bathrooms: number
  notes: string
  auto_assign: boolean
}

interface FormErrors {
  [key: string]: string
}

export function BookingForm({ onBookingCreated }: BookingFormProps) {
  const [step, setStep] = useState<'draft' | 'finalize'>('draft')
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isValid, setIsValid] = useState(false)

  // Data for dropdowns
  const [services, setServices] = useState<Service[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [suburbs, setSuburbs] = useState<Suburb[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const { user, loading: authLoading } = useAuth()

  // Form data
  const [formData, setFormData] = useState<FormData>({
    service_id: '',
    area_id: '',
    region_id: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    address: '',
    postcode: '',
    bedrooms: 1,
    bathrooms: 1,
    notes: '',
    auto_assign: true
  })

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [servicesRes, regionsRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/regions')
        ])

        if (servicesRes.ok && regionsRes.ok) {
          const [servicesData, regionsData] = await Promise.all([
            servicesRes.json(),
            regionsRes.json()
          ])
          setServices(servicesData.services || [])
          setRegions(regionsData || [])
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

  // Fetch suburbs when region changes
  useEffect(() => {
    if (formData.region_id) {
      const fetchSuburbs = async () => {
        try {
          const response = await fetch(`/api/suburbs?region_id=${formData.region_id}`)
          if (response.ok) {
            const data = await response.json()
            setSuburbs(data || [])
          }
        } catch (err) {
          console.error('Error fetching suburbs:', err)
        }
      }
      fetchSuburbs()
    } else {
      setSuburbs([])
    }
  }, [formData.region_id])

  // Validate form data
  useEffect(() => {
    const errors: FormErrors = {}
    
    if (step === 'draft') {
      if (!formData.service_id) errors.service_id = 'Service is required'
      if (!formData.area_id) errors.area_id = 'Suburb is required'
      if (!formData.booking_date) errors.booking_date = 'Booking date is required'
      if (!formData.start_time) errors.start_time = 'Start time is required'
      if (!formData.end_time) errors.end_time = 'End time is required'
      
      // Validate time logic
      if (formData.start_time && formData.end_time) {
        const start = new Date(`2000-01-01T${formData.start_time}`)
        const end = new Date(`2000-01-01T${formData.end_time}`)
        if (end <= start) {
          errors.end_time = 'End time must be after start time'
        }
      }
    } else {
      if (!formData.address.trim()) errors.address = 'Address is required'
      if (!formData.postcode.trim()) errors.postcode = 'Postcode is required'
      if (formData.bedrooms < 1) errors.bedrooms = 'At least 1 bedroom is required'
      if (formData.bathrooms < 1) errors.bathrooms = 'At least 1 bathroom is required'
    }

    setFormErrors(errors)
    setIsValid(Object.keys(errors).length === 0)
  }, [formData, step])

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError(null)

    try {
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
      setStep('finalize')
      onBookingCreated?.(booking.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingId || !isValid) return

    setLoading(true)
    setError(null)

    try {
      // Finalize the booking with customer details
      await finalizeBooking(bookingId, {
        address: formData.address,
        postcode: formData.postcode,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms
      })

      // Auto-assign cleaner if requested
      if (formData.auto_assign) {
        await autoAssignCleaner(bookingId)
      }

      // Success! Redirect to confirmation or show success message
      setError(null)
      alert('Booking created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize booking')
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

  if (step === 'draft') {
    return (
      <form onSubmit={handleCreateDraft} className="space-y-6">
        <h2 className="text-xl font-semibold">Create Booking Draft</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Service *</label>
          <select
            value={formData.service_id}
            onChange={(e) => handleInputChange('service_id', e.target.value)}
            className={`w-full border rounded px-3 py-2 ${formErrors.service_id ? 'border-red-500' : 'border-gray-300'}`}
            required
          >
            <option value="">Select a service</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.base_price}
              </option>
            ))}
          </select>
          {formErrors.service_id && (
            <p className="text-red-500 text-sm mt-1">{formErrors.service_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Region *</label>
          <select
            value={formData.region_id}
            onChange={(e) => {
              handleInputChange('region_id', e.target.value)
              handleInputChange('area_id', '') // Reset suburb when region changes
            }}
            className={`w-full border rounded px-3 py-2 ${formErrors.region_id ? 'border-red-500' : 'border-gray-300'}`}
            required
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
          <label className="block text-sm font-medium mb-1">Suburb *</label>
          <select
            value={formData.area_id}
            onChange={(e) => handleInputChange('area_id', e.target.value)}
            className={`w-full border rounded px-3 py-2 ${formErrors.area_id ? 'border-red-500' : 'border-gray-300'}`}
            required
            disabled={!formData.region_id}
          >
            <option value="">Select a suburb</option>
            {suburbs.map(suburb => (
              <option key={suburb.id} value={suburb.id}>
                {suburb.name} {suburb.postcode && `(${suburb.postcode})`}
              </option>
            ))}
          </select>
          {formErrors.area_id && (
            <p className="text-red-500 text-sm mt-1">{formErrors.area_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Booking Date *</label>
          <input
            type="date"
            value={formData.booking_date}
            onChange={(e) => handleInputChange('booking_date', e.target.value)}
            className={`w-full border rounded px-3 py-2 ${formErrors.booking_date ? 'border-red-500' : 'border-gray-300'}`}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {formErrors.booking_date && (
            <p className="text-red-500 text-sm mt-1">{formErrors.booking_date}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time *</label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              className={`w-full border rounded px-3 py-2 ${formErrors.start_time ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {formErrors.start_time && (
              <p className="text-red-500 text-sm mt-1">{formErrors.start_time}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time *</label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              className={`w-full border rounded px-3 py-2 ${formErrors.end_time ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {formErrors.end_time && (
              <p className="text-red-500 text-sm mt-1">{formErrors.end_time}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
            placeholder="Any special instructions or notes..."
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="auto_assign"
            checked={formData.auto_assign}
            onChange={(e) => handleInputChange('auto_assign', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="auto_assign" className="text-sm font-medium">
            Auto-assign cleaner
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Draft Booking'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleFinalizeBooking} className="space-y-6">
      <h2 className="text-xl font-semibold">Finalize Booking</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Address *</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className={`w-full border rounded px-3 py-2 ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter your full address"
          required
        />
        {formErrors.address && (
          <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Postcode *</label>
        <input
          type="text"
          value={formData.postcode}
          onChange={(e) => handleInputChange('postcode', e.target.value)}
          className={`w-full border rounded px-3 py-2 ${formErrors.postcode ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter postcode"
          required
        />
        {formErrors.postcode && (
          <p className="text-red-500 text-sm mt-1">{formErrors.postcode}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bedrooms *</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.bedrooms}
            onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
            className={`w-full border rounded px-3 py-2 ${formErrors.bedrooms ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {formErrors.bedrooms && (
            <p className="text-red-500 text-sm mt-1">{formErrors.bedrooms}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bathrooms *</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.bathrooms}
            onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
            className={`w-full border rounded px-3 py-2 ${formErrors.bathrooms ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {formErrors.bathrooms && (
            <p className="text-red-500 text-sm mt-1">{formErrors.bathrooms}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setStep('draft')}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
        >
          Back to Draft
        </button>
        <button
          type="submit"
          disabled={loading || !isValid}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Finalizing...' : 'Finalize Booking'}
        </button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { createDraftBooking, finalizeBooking, autoAssignCleaner } from '@/lib/booking-utils'
import { useAuth } from '@/hooks/useAuth'

interface BookingFormProps {
  onBookingCreated?: (bookingId: string) => void
}

export function BookingForm({ onBookingCreated }: BookingFormProps) {
  const [step, setStep] = useState<'draft' | 'finalize'>('draft')
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { user, loading: authLoading } = useAuth()

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

  if (authLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  // Draft booking form data
  const [draftData, setDraftData] = useState({
    suburb_id: '',
    service_id: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    total_price: 0,
    notes: '',
    auto_assign: true
  })

  // Final booking form data
  const [finalData, setFinalData] = useState({
    address: '',
    postcode: '',
    bedrooms: 0,
    bathrooms: 0
  })

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const booking = await createDraftBooking({
        customer_id: user!.id,
        ...draftData
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
    if (!bookingId) return

    setLoading(true)
    setError(null)

    try {
      // Finalize the booking with customer details
      await finalizeBooking(bookingId, finalData)

      // Auto-assign cleaner if requested
      if (draftData.auto_assign) {
        await autoAssignCleaner(bookingId)
      }

      // Success! You could redirect to payment or confirmation page
      alert('Booking created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize booking')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'draft') {
    return (
      <form onSubmit={handleCreateDraft} className="space-y-4">
        <h2 className="text-xl font-semibold">Create Booking Draft</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Suburb</label>
          <input
            type="text"
            value={draftData.suburb_id}
            onChange={(e) => setDraftData(prev => ({ ...prev, suburb_id: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Service</label>
          <input
            type="text"
            value={draftData.service_id}
            onChange={(e) => setDraftData(prev => ({ ...prev, service_id: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Booking Date</label>
          <input
            type="date"
            value={draftData.booking_date}
            onChange={(e) => setDraftData(prev => ({ ...prev, booking_date: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={draftData.start_time}
              onChange={(e) => setDraftData(prev => ({ ...prev, start_time: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              value={draftData.end_time}
              onChange={(e) => setDraftData(prev => ({ ...prev, end_time: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Price</label>
          <input
            type="number"
            step="0.01"
            value={draftData.total_price}
            onChange={(e) => setDraftData(prev => ({ ...prev, total_price: parseFloat(e.target.value) }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={draftData.notes}
            onChange={(e) => setDraftData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="auto_assign"
            checked={draftData.auto_assign}
            onChange={(e) => setDraftData(prev => ({ ...prev, auto_assign: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="auto_assign" className="text-sm font-medium">
            Auto-assign cleaner
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Draft Booking'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleFinalizeBooking} className="space-y-4">
      <h2 className="text-xl font-semibold">Finalize Booking</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          value={finalData.address}
          onChange={(e) => setFinalData(prev => ({ ...prev, address: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Postcode</label>
        <input
          type="text"
          value={finalData.postcode}
          onChange={(e) => setFinalData(prev => ({ ...prev, postcode: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bedrooms</label>
          <input
            type="number"
            min="0"
            value={finalData.bedrooms}
            onChange={(e) => setFinalData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) }))}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bathrooms</label>
          <input
            type="number"
            min="0"
            value={finalData.bathrooms}
            onChange={(e) => setFinalData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) }))}
            className="w-full border rounded px-3 py-2"
            required
          />
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
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Finalizing...' : 'Finalize Booking'}
        </button>
      </div>
    </form>
  )
}

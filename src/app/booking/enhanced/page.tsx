'use client'

import { useState } from 'react'
import { BookingForm } from '@/components/booking/BookingForm'
import { getUserBookings, getBookingDetails } from '@/lib/booking-utils'
import { Booking, BookingDetailsView } from '@/lib/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function EnhancedBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingDetailsView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the enhanced booking system.</p>
          <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  const handleLoadBookings = async () => {
    setLoading(true)
    setError(null)

    try {
      const userBookings = await getUserBookings()
      setBookings(userBookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleViewBookingDetails = async (bookingId: string) => {
    setLoading(true)
    setError(null)

    try {
      const details = await getBookingDetails(bookingId)
      setSelectedBooking(details)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingCreated = (_bookingId: string) => {
    // Refresh the bookings list
    handleLoadBookings()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Booking System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test the new booking features including DRAFT status, auto-assign, and customer details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create New Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm 
                  onBookingCreated={handleBookingCreated}
                />
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <Button onClick={handleLoadBookings} disabled={loading}>
                  {loading ? 'Loading...' : 'Load Bookings'}
                </Button>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                {bookings.length === 0 ? (
                  <p className="text-gray-500">No bookings found. Create a new booking to get started.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">Booking #{booking.id.slice(-8)}</h3>
                            <p className="text-sm text-gray-600">
                              {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'Date TBD'} at {booking.start_time || 'Time TBD'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'READY_FOR_PAYMENT' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <p>Total: ${booking.total_price}</p>
                          {booking.cleaner_id && <p>Cleaner assigned: {booking.cleaner_id.slice(-8)}</p>}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewBookingDetails(booking.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold">Status:</label>
                      <p className="text-gray-600">{selectedBooking.status}</p>
                    </div>
                    <div>
                      <label className="font-semibold">Total Price:</label>
                      <p className="text-gray-600">${selectedBooking.total_price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold">Date:</label>
                      <p className="text-gray-600">{selectedBooking.booking_date ? new Date(selectedBooking.booking_date).toLocaleDateString() : 'No date set'}</p>
                    </div>
                    <div>
                      <label className="font-semibold">Time:</label>
                      <p className="text-gray-600">{selectedBooking.start_time} - {selectedBooking.end_time}</p>
                    </div>
                  </div>

                  {selectedBooking.customer_full_name && (
                    <div>
                      <label className="font-semibold">Customer:</label>
                      <p className="text-gray-600">{selectedBooking.customer_full_name}</p>
                    </div>
                  )}

                  {selectedBooking.cleaner_full_name && (
                    <div>
                      <label className="font-semibold">Cleaner:</label>
                      <p className="text-gray-600">{selectedBooking.cleaner_full_name}</p>
                    </div>
                  )}

                  {selectedBooking.service_name && (
                    <div>
                      <label className="font-semibold">Service:</label>
                      <p className="text-gray-600">{selectedBooking.service_name}</p>
                    </div>
                  )}

                  {selectedBooking.suburb_name && (
                    <div>
                      <label className="font-semibold">Location:</label>
                      <p className="text-gray-600">{selectedBooking.suburb_name}, {selectedBooking.suburb_postcode}</p>
                    </div>
                  )}

                  {selectedBooking.notes && (
                    <div>
                      <label className="font-semibold">Notes:</label>
                      <p className="text-gray-600">{selectedBooking.notes}</p>
                    </div>
                  )}

                  {selectedBooking.special_instructions && (
                    <div>
                      <label className="font-semibold">Special Instructions:</label>
                      <p className="text-gray-600">{selectedBooking.special_instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
